terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
      version = "=2.12.1" 
    }
   kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0.0"
    }
  }
}
provider "kubernetes" {
  config_path = "/home/nour/.kube/config"
} 

provider "helm" {
  kubernetes {
   config_path = "/home/nour/.kube/config" 
   insecure      = true
 }
}


	
