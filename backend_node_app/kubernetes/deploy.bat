@echo off

echo Deploying Pods...
kubectl apply -f 01_deployment.yaml
 echo Pods deployed...

echo.

echo Deploying Services...
kubectl apply -f 02_service.yaml
echo Services deployed..

echo.

IF "%1"=="i" (
   echo Deploying Ingress..
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.3/deploy/static/provider/cloud/deploy.yaml
   echo Ingress controller deployed..
   echo.
   kubectl apply -f 03_ingress.yaml
   echo Ingress deployed..
)

echo.

IF "%1"=="f" (
    echo Forwarding port..
    kubectl port-forward service/node-mongo-api-service 3000:3000
    echo port forward..
    echo Now you can access application - http://localhost:3000/
)