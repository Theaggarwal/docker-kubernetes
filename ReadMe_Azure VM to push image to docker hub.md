# To create and use an Azure VM to push a Docker image to Docker Hub

## Overview:
### ✅ 1. Create a Linux VM on Azure
### 🔐 2. SSH (Secure Shell) into the VM - To connect to your Azure Ubuntu VM.
### 🐳 3. Install Docker on the VM
### 🛠️ 4. Build your Docker image
### 📤 5. Push the image to Docker Hub


## ✅ 1. Create a Linux VM on Azure


### 1.1 Install Azure CLI (on your local machine)
Download: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

### 1.2 Login
az login

### 1.3 Create a Resource Group
az group create --name docker-rg --location eastus

### 1.4 Create the VM (Ubuntu)
az vm create --resource-group docker-rg --name docker-vm --image Ubuntu2204 --admin-username azureuser --generate-ssh-keys
Note: This will output the VM's public IP.


### 1.5 To get the public IP of the VM (Ubuntu)
az vm show   --resource-group docker-rg  --name docker-vm  -d --query publicIps -o tsv


## 🔐 2. SSH into the VM

### 2.1 Use the generated SSH key:
ssh azureuser@<public-ip> ex- ssh azureuser@4.246.184.35

Example- 
C:\Windows\System32> ssh azureuser@4.246.184.35
Notice: prompt is changed to something like "azureuser@docker-vm:"


## 🐳 3. Install Docker on the Azure VM

### 3.1 Run below commands, inside the VM:
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker $USER
newgrp docker

### 3.2 Start Docker:  
sudo systemctl start docker
sudo systemctl enable docker

### 3.3 Test:
docker version
docker run hello-world 

## 🛠️ 4. Build a Docker Image

### 4.1 Copy files from your local machine to VM.
scp ./Dockerfile azureuser@<public-ip>:/home/azureuser/

Example:
C:\Windows\System32>scp -r "C:\SA_Shared\NAGP\WK2_Docker_Kubernetes\Assignment\SushilAggarwal_3142058_Kubernetes\docker-kubernetes\backend_node_app\Temp2" azureuser@172.174.18.99:/home/azureuser/

Note: it will copy all files to VM's directory.

### 4.2 Verify Copied files

C:\Windows\System32> **ssh azureuser@4.246.184.35**
**Notice:** prompt is changed to something like "azureuser@docker-vm:"
***azureuser@docker-vm:~/temp$*** **ls**
Dockerfile  app.js  models  package.json
(it will list all files).

### 4.3 Build image

docker login

docker build -t <repo>:<tag> . 
*Example:*
docker build -t node-mongo-api:v7 . 


### 4.4 Tag the image
docker tag <repo>:<tag> <docker-hub-repo>:<tag>
*Example*
docker tag node-mongo-api:v7 theaggarwal/node-mongo-api:v7




## 📤 5. Push the image to Docker Hub
docker push <docker-hub-repo>:<tag>
*Example*
docker push theaggarwal/node-mongo-api:v7



**Note: to delete resource group if not in use:**
az group delete --name docker-rg --yes --no-wait


