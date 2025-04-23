# Running the backend locally without Docker
```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt 
fastapi dev main.py
```
After that, the endpoints are available under `http://127.0.0.1:8000`.
# Known problems
At the moment we added the Python backend, Python did not yet have a standard to manage dependencies similar to Node.js with a package.json and package-lock.json file. Thus currently the requirements.txt is created manually and not with the `pip freeze` command. Suggestions are welcome.