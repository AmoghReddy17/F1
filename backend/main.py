from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import fastf1
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://api.jolpi.ca/ergast/f1"

# --- 1. TELEMETRY ENGINE (Unified & Robust) ---
@app.get("/api/telemetry/{year}/{round}/{driver_code}")
def get_telemetry(year: int, round: int, driver_code: str):
    driver_code = driver_code.upper()
    try:
        # 2026 Simulation: Use 2025 data as a baseline for physics
        target_year = year if year < 2026 else 2025
        session = fastf1.get_session(target_year, round, 'Q')
        session.load(telemetry=True)
        
        driver_laps = session.laps.pick_drivers(driver_code)
        if len(driver_laps) == 0: return []

        # Try to pick fastest, fallback to manual sort
        fastest_lap = driver_laps.pick_fastest()
        if fastest_lap is None:
            fastest_lap = driver_laps.sort_values(by='LapTime').iloc[0]

        telemetry = fastest_lap.get_telemetry()
        
        # Apply 2026 performance boost if simulating
        boost = 1.07 if year == 2026 else 1.0
        
        return [
            {"Distance": float(d), "Speed": float(s) * boost} 
            for d, s in zip(telemetry['Distance'], telemetry['Speed'])
        ][::10] # Sample every 10th point for performance
    except Exception as e:
        print(f"Telemetry Error: {e}")
        return []

# --- 2. RACE RESULTS (For the Race Hub) ---
# --- 🏁 UPDATED RACE RESULTS (Using Real 2026 Data) ---
@app.get("/api/results/{year}/{round}")
def get_race_results(year: str, round: str):
    try:
        # We no longer need the 2024 mapping! 
        # The API is serving real 2026 data now.
        response = requests.get(f"{BASE_URL}/{year}/{round}/results.json")
        return response.json()
        
    except Exception as e:
        print(f"Results Error: {e}")
        return {"error": str(e)}

# --- 3. DRIVER HISTORY & STATS (For the Driver Profile) ---
@app.get("/api/driver-history/{year}/{driver_code}")
def get_driver_history(year: str, driver_code: str):
    try:
        driver_code = driver_code.upper()
        
        # 1. Fetch current standings to find the "Real ID" for this code
        # This makes the mapping DYNAMIC. No more hardcoded dict!
        standings_res = requests.get(f"{BASE_URL}/{year}/driverStandings.json").json()
        standings = standings_res['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings']
        
        # Search for the driver object that has the matching 3-letter code
        driver_stat = next((s for s in standings if s['Driver']['code'] == driver_code), None)
        
        if not driver_stat:
            return {"error": f"Driver {driver_code} not found in {year} standings"}

        # Grab the actual ID (e.g., 'antonelli') from the API's own data
        driver_id = driver_stat['Driver']['driverId']

        # 2. Now fetch the history using the dynamic ID
        res_history = requests.get(f"{BASE_URL}/{year}/drivers/{driver_id}/results.json").json()
        races = res_history['MRData']['RaceTable']['Races']

        # 3. Process the data (same as before)
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
                "teamColor": "#6CD3BF", # We could even pull this from a separate config later
                "totalPoints": total_points,
                "podiums": podiums,
                "rank": driver_stat['position'],
                "avgFinish": round(sum(finishes)/len(finishes), 1) if finishes else 0,
                "gapToLeader": int(leader_points - total_points)
            }
        }
    except Exception as e:
        print(f"Dynamic History Error: {e}")
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
from datetime import datetime

@app.get("/api/next-race")
def get_next_race():
    try:
        # 1. Fetch the full 2026 calendar
        response = requests.get(f"{BASE_URL}/2026.json")
        races = response.json()['MRData']['RaceTable']['Races']
        
        # 2. Find the first race where the date is today or in the future
        now = datetime.now()
        next_race = next(
            (r for r in races if datetime.strptime(r['date'], '%Y-%m-%d') >= now), 
            races[-1] # Fallback to last race if season is over
        )
        
        return next_race
    except Exception as e:
        return {"error": str(e)}
@app.get("/api/weather/{lat}/{lon}")
def get_track_weather(lat: float, lon: float):
    try:
        # Open-Meteo is a great free API for weather data
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,surface_pressure&forecast_days=1"
        res = requests.get(url).json()
        
        current = res['current']
        return {
            "air_temp": f"{round(current['temperature_2m'])}°C",
            "track_temp": f"{round(current['temperature_2m'] + 5)}°C", # Estimate: Track is usually hotter than air
            "humidity": f"{current['relative_humidity_2m']}%",
            "pressure": f"{current['surface_pressure']} hPa"
        }
    except Exception as e:
        return {"error": "Weather unavailable"}