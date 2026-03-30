from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import fastf1
import numpy as np
import os
from datetime import datetime

# 🏁 1. ENABLE FASTF1 CACHE (Crucial for Speed)
# This prevents downloading the same 100MB of data on every request
if not os.path.exists('cache'):
    os.makedirs('cache')
fastf1.Cache.enable_cache('cache')

app = FastAPI()

# 🏁 2. PRODUCTION CORS SETTINGS
# Replace the placeholder URL with your actual Render frontend link
origins = [
    "http://localhost:5173",
    "https://f1-1-pro-dashboard.onrender.com", # <--- Your actual Render frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # 🏁 Use the list instead of ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://api.jolpi.ca/ergast/f1"

# --- 1. TELEMETRY ENGINE ---
@app.get("/api/telemetry/{year}/{round}/{driver_code}")
def get_telemetry(year: int, round: int, driver_code: str):
    driver_code = driver_code.upper()
    try:
        # Simulation logic: physics based on 2025 baseline
        target_year = year if year < 2026 else 2025
        session = fastf1.get_session(target_year, round, 'Q')
        session.load(telemetry=True)
        
        driver_laps = session.laps.pick_drivers(driver_code)
        if len(driver_laps) == 0: return []

        fastest_lap = driver_laps.pick_fastest()
        if fastest_lap is None:
            fastest_lap = driver_laps.sort_values(by='LapTime').iloc[0]

        telemetry = fastest_lap.get_telemetry()
        
        boost = 1.07 if year == 2026 else 1.0
        
        return [
            {"Distance": float(d), "Speed": float(s) * boost} 
            for d, s in zip(telemetry['Distance'], telemetry['Speed'])
        ][::10] 
    except Exception as e:
        print(f"Telemetry Error: {e}")
        return []

# --- 2. RACE RESULTS ---
@app.get("/api/results/{year}/{round}")
def get_race_results(year: str, round: str):
    try:
        response = requests.get(f"{BASE_URL}/{year}/{round}/results.json")
        return response.json()
    except Exception as e:
        print(f"Results Error: {e}")
        return {"error": str(e)}

# --- 3. DRIVER HISTORY & STATS ---
@app.get("/api/driver-history/{year}/{driver_code}")
def get_driver_history(year: str, driver_code: str):
    try:
        driver_code = driver_code.upper()
        standings_res = requests.get(f"{BASE_URL}/{year}/driverStandings.json").json()
        standings = standings_res['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings']
        
        driver_stat = next((s for s in standings if s['Driver']['code'] == driver_code), None)
        if not driver_stat:
            return {"error": f"Driver {driver_code} not found"}

        driver_id = driver_stat['Driver']['driverId']
        res_history = requests.get(f"{BASE_URL}/{year}/drivers/{driver_id}/results.json").json()
        races = res_history['MRData']['RaceTable']['Races']

        history_data = []
        total_points = 0
        finishes = []
        podiums = 0
        leader_points = float(standings[0]['points'])

        for race in races:
            res = race['Results'][0]
            pts = float(res.get('points', 0))
            total_points += pts
            pos = int(res.get('position', 0))
            finishes.append(pos)
            if pos <= 3: podiums += 1
            
            history_data.append({
                "round": race['round'],
                "roundName": race['raceName'].replace("Grand Prix", "GP"),
                "points": total_points,
                "position": pos
            })

        return {
            "history": history_data,
            "stats": {
                "firstName": driver_stat['Driver']['givenName'],
                "lastName": driver_stat['Driver']['familyName'],
                "teamName": driver_stat['Constructors'][0]['name'],
                "teamColor": "#6CD3BF", 
                "totalPoints": total_points,
                "podiums": podiums,
                "rank": driver_stat['position'],
                "avgFinish": round(sum(finishes)/len(finishes), 1) if finishes else 0,
                "gapToLeader": int(leader_points - total_points)
            }
        }
    except Exception as e:
        print(f"History Error: {e}")
        return {"error": str(e)}

# --- 4. STANDARD PROXIES ---
@app.get("/api/standings/{year}")
def get_standings(year: str):
    return requests.get(f"{BASE_URL}/{year}/driverStandings.json").json()

@app.get("/api/constructorStandings/{year}")
def get_constructor_standings(year: str):
    return requests.get(f"{BASE_URL}/{year}/constructorStandings.json").json()

@app.get("/api/calendar/{year}")
def get_calendar(year: str):
    return requests.get(f"{BASE_URL}/{year}.json").json()

@app.get("/api/next-race")
def get_next_race():
    try:
        response = requests.get(f"{BASE_URL}/2026.json")
        races = response.json()['MRData']['RaceTable']['Races']
        now = datetime.now()
        next_race = next(
            (r for r in races if datetime.strptime(r['date'], '%Y-%m-%d') >= now), 
            races[-1]
        )
        return next_race
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/weather/{lat}/{lon}")
def get_track_weather(lat: float, lon: float):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,surface_pressure&forecast_days=1"
        res = requests.get(url).json()
        current = res['current']
        return {
            "air_temp": f"{round(current['temperature_2m'])}°C",
            "track_temp": f"{round(current['temperature_2m'] + 5)}°C",
            "humidity": f"{current['relative_humidity_2m']}%",
            "pressure": f"{current['surface_pressure']} hPa"
        }
    except Exception as e:
        return {"error": "Weather unavailable"}