# Host and communicate Backend service with database on kubernetes pod

## Useful links
**Code Repository:**

**Docker hub URL:** https://hub.docker.com/repository/docker/theaggarwal/node-mongo-api/general

URL for Service API tier to view the records from backend tier:

1. [GET] {{baseURL}}/api/ => to get all users from db.

2. [GET] {{baseURL}}/api/dummy-user => to insert dummy user.

3. [GET] {{baseURL}}/api/health => to check if service is working fine.

4. [POST] {{baseURL}}/api/users => to post user details.

Request Body (json)

    {
	    "name": "SA user",    
	    "email": "sa@gmail.com",    
	    "age": 30    
    }

  ## Following is handled in the repository.

> Database - mongoDB

- Hosted on 1 pod
- Not exposed outside the cluster (Headless service - ClusterIp=none)
- Persistent storage
- Stateful set (fix pod name, useful for connection string.)
- Secrets to store DB Credentials and connectionstring
- ConfigMap and Job for seeding.
Note: clusterIP service is used to expose pod internally in the cluster. Headless service is like clusterIP svc but it does not have IP.

> Backend service - Nodejs application
- Hosted on 4 pods.
- Written in Node js and connects with mongo db to fetch/save data (it fetch connection string and credentials from Secrets).
- Exposed to outside the cluster through Ingress.
- No Persistent storage  
  

## Deployment

### Prerequisite :

#### 1. Install Azure CLI, run below command in Powershell
> $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi; Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'; Remove-Item .\AzureCLI.msi"

Restart Powershell and run “az version” command to check azure CLI is installed or not.

#### 2. Install the Kubernetes CLI
> az aks install-cli

#### 3. Install kubectl
> curl.exe -LO "https://dl.k8s.io/release/v1.33.0/bin/windows/amd64/kubectl.exe"


## Deployment Steps:

### S1: Login to Azure
> az login

### S2: Create Resource Group "saResourceGroup"
> az group create --name saResourceGroup --location eastus

### S3: Build and Push image to repository (Docker hub or ACR)

#### 2 options of Repository to choose from.
To deploy and use Backend service (nodejs), we need to first push the image to some repository.

2 Options to keep the image:
1. Docker hub
2. ACR.

#####  Option 1: Push backend app (nodejs app) image to Docker Hub

Note: If Docker deskop is installed on the machine.

> docker login (not needed, just run docker desktop locally.)

> docker build -t node-mongo-api:v2 . ()

> docker tag node-mongo-api:v2 theaggarwal/node-mongo-api:v2

> docker push theaggarwal/node-mongo-api:v2

Note: If Docker deskop cannot be installed on the machine. Can install Docker deskop on Azure VM and then build/push the image.
  Refer "ReadMe_Azure VM to push image to docker hub .md"  file: it contains exact steps to execute. 


#####  Option 2: Push backend app (nodejs app) image to Azure container registry
Note: we can PUSH Image to ACR from Code directly (no need to build it first). Need to pass dockerfile along with the code to the Azure command, it will build image on cloud directly and push image to ACR.

##### O2.1 Create Container registry "sacontainerregistry"
> az acr create --resource-group saResourceGroup --name sacontainerregistry --sku Basic

##### O2.1 To create image at runtime (from code directly) and push to ACR
> az acr build --image node-mongo-api:v1 --registry sacontainerregistry --file Dockerfile .

### S4: Create cluster

#### If ACR is used.
> az aks create --resource-group saResourceGroup --name myAKSCluster --node-count 1 --node-vm-size Standard_D2s_v3 --generate-ssh-keys --attach-acr sacontainerregistry

#### If ACR is not used.

> az aks create --resource-group saResourceGroup --name myAKSCluster --node-count 1 --node-vm-size Standard_D2s_v3


 Note: Below are the command to start and stop cluster. May need to execute them to save cost. 
##### start cluster
> az aks start --name myAKSCluster --resource-group saResourceGroup
##### stop cluster
> az aks stop --name myAKSCluster --resource-group saResourceGroup


### S5: Connect to cluster using kubectl
> az aks get-credentials --resource-group saResourceGroup --name myAKSCluster

### S6:  Deploy Mongo db. (Path: Database_mongodb\kubernetes)
**Deploy PV**
> kubectl apply -f 00_pv.yaml >> kubectl get pv

**Deploy PVC**
> kubectl apply -f 01_pvc.yaml >> kubectl get pvc

**Deploy Secrets - for DB credentials**
> kubectl apply -f 02_secret_db-credential.yaml >> kubectl get secrets

**Deploy Stateful Set - mongo pod**
> kubectl apply -f 03_stateful-set.yaml >> kubectl get po
(Note: POD is created with name: 'mongo-0', port : 27017)

**Deploy headless svc**
> kubectl apply -f 04_headless-svc.yaml >> kubectl get services 

**Deploy Secrets - for connection string**
> kubectl apply -f 05_secret_connection-string-expose.yaml

**Deploy configMap for Seed data**
> kubectl apply -f 06_mongo-seed-config.yaml

**Deploy job for executing Seed data on db.**
> kubectl apply -f 07_job_seeding.yaml

### S7:  Verify Mongo db. 
  
#### S7.1 Create temp container and verify mongo db data.
Run temp container that will run the mongoshell. pod "mongo-shell" will be deleted on exit.
> kubectl run mongo-shell --image=mongo:4.0.17 --rm -it -- bash

####  S7.2 Connect with mongo db

mongo "mongodb://<pod-name>.<headless-service-name>:port"
Example:
> mongo "mongodb://mongo-0.mongo-headless:27017"

Where "mongo-0" is pod name (stateful svc), "mongo-headless" is headless svc name (CLusterIp=None) with port 27017.

####  S7.3  show db and collection data.
Run below commands:
> use admin
> db.auth("adminuser","password123")
> show dbs
> use mydb
> show collections
> db.users.find({})

To insert data to the collection:
> db.users.insertOne({ name: "Sushil", age:3 })

Note: "show dbs" command does not show records, until auth is done. (So, Need to connect to admin first (use admin) >> db.auth("adminuser","password123"))

 

### S8:  Deploy API/Backend nodejs application (Path: backend_node_app\kubernetes)  

#### S8.1 Verify using Nodejs application.

Run below commands
**Deploy pod**
> kubectl apply -f 01_deployment.yaml

**Deploy Nodeport svc**
> kubectl apply -f 02_service.yaml

**Deploy ingress controller**

> kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.3/deploy/static/provider/cloud/deploy.yaml

**Deploy ingress**
> kubectl apply -f 03_ingress.yaml
  
### S9:  Verify API Deployment 
To get the external ip address and port of the deployed ingress.
> kubectl get ingress 

Once External IP is known, Execute endpoints on browser/postman:
Note: there is postman collection in backend service, can use it, only need to change default IP to external ip, that we got from ingress.
http://<external_ip>/api
http://<external_ip>/health
http://<external_ip>/dummy-user
 
Note: to Delete ingress controller:
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.3/deploy/static/provider/cloud/deploy.yaml

## Debugging:

#### 1. To attach or use mongo db (deployed on K8s pod) from local machine:
1. expose nodeport svc on nodeport say 32017.
2. use Port Forwarding for local browsing: kubectl port-forward service/<node-port-svc-name>  <local-port>:<target-port> [It lets you access the service via http://localhost:<local-port>.]
example: kubectl port-forward service/mongodb-nodeport 27017:27017
3. mongodb is ready to be used on local machine, using connection string: mongodb://localhost:27017?authSource=admin. Make changes in app.js
4. Try below endpoints of nodejs application.
[GET] http://localhost:3000/
[GET] http://localhost:3000/dummy-user
[POST] http://localhost:3000/users

#### 2. To see environment variable values:
> kubectl exec <pod-name> -- env


#### 3. To see pod logs
> kubectl logs <pod-name>


#### 4. To check image version used by the pod
> kubectl get pod <pod-name> -o jsonpath="{.spec.containers[*].image}"

#### 5. Test the service from another temp pod
Test from Inside the Cluster Try curling the service from another pod:
kubectl run test-pod --rm -i --tty --image=busybox -- /bin/sh

#### 6.  Clean up - database (1 by 1)
> kubectl delete -f 07_job_seeding.yaml
> kubectl delete -f 06_mongo-seed-config.yaml
> kubectl delete -f 05_secret_connection-string-expose.yaml
> kubectl delete -f 04_headless-svc.yaml
> kubectl delete -f 03_stateful-set.yaml
> kubectl apply -f 02_secret_db-credential.yaml
> kubectl apply -f 01_pvc.yaml
> kubectl apply -f 00_pv.yaml