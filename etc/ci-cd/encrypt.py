import os
import subprocess

def parse_env_file(env_file):
    env_vars = {}
    with open(env_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):  # Ignore empty lines and comments
                continue
            key, value = map(str.strip, line.split("=", 1))
            env_vars[key] = value
    return env_vars

def main(directory):
    # Change directory or exit if it fails
    try:
        os.chdir(directory)
    except FileNotFoundError:
        print("Directory not found.")
        return

    os.makedirs("./etc", exist_ok=True)

    # Load environment variables from .env file
    env_file = ".env"
    if os.path.isfile(env_file):
        env_vars = parse_env_file(env_file)
        os.environ.update(env_vars)
    # Prompt for BUILD_KEY if not set
    build_key = os.environ.get("BUILD_KEY")
    if build_key is None:
        build_key = input("ENTER A SECRET PHRASE: ")

    # Prompt for BUILD_ENV if not set
    build_env = os.environ.get("BUILD_ENV")
    if build_env is None:
        build_env = input("SPECIFY THE BUILD ENVIRONMENT: ")

    secret_file = "./etc/secrets.tar.gz.ssl"
    subprocess.run(["docker", "run", "-i", "-v", f"{os.getcwd()}:/app", "kytel0925/ci-cd", "encrypt-secrets.sh", build_key])
    subprocess.run(["docker", "run", "-i", "-v", f"{os.getcwd()}:/app", "kytel0925/ci-cd", "mv", secret_file, f"./etc/secrets.{build_env}.tar.gz.ssl"])

if __name__ == "__main__":
    main('.')
