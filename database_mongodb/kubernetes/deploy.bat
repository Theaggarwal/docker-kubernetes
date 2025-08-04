@echo off

kubectl apply -f 00_pv.yaml
echo "PV deployed.."
echo.

kubectl apply -f 01_pvc.yaml
echo "PVC deployed.."
echo.

kubectl apply -f  02_secret_db-credential.yaml
echo "Secret (DB Credentials) deployed.."
echo.

kubectl apply -f 03_stateful-set.yaml
echo "Stateful set (POD) deployed.."
echo.

kubectl apply -f 04_headless-svc.yaml
echo "Headless svc deployed.."
echo.

kubectl apply -f 05_secret_connection-string-expose.yaml
echo "Secret (DB connection string) deployed.."
echo.

IF "%1"=="seed" (
    kubectl apply -f 06_mongo-seed-config.yaml
    echo "Config map (for seed json) deployed.."
    echo.

    kubectl apply -f 07_job_seeding.yaml
    echo "Job (for mongodb seeding) deployed.."
    echo.
)

IF "%1"=="f" (
    echo creating NodePort service..
    kubectl apply -f extras\08_NodePort.yaml
    echo NodePort created..

    echo Forwarding port..
    kubectl port-forward service/mongodb-nodeport 27017:27017
    echo port forward..
    echo Now you can access mongodb using "mongodb://localhost:27017?authSource=admin"
)
