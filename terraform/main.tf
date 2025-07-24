
resource "helm_release" "nginx_ingress" {
 
  name       = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.12.1" 
  recreate_pods = true
  dependency_update = true
  cleanup_on_fail = true
  namespace  = "ingress-nginx"   
  create_namespace = true  
  
   set {
    
      name  = "controller.service.type"
      value = "LoadBalancer"
    }
   set {  

      name  = "controller.admissionWebhooks.enabled"
      value = "false"
    }
  
  
}

resource "helm_release" "argo_cd" {
  name             = "argo-cd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true

  values = [file("values/argocd-values.yaml")]

 }

resource "kubernetes_ingress_v1" "argocd_ingress" {
  
  metadata {
    name      = "argocd-server"
    namespace = "argocd"
    
  }

  spec {
    ingress_class_name = "nginx"

    rule {
      host = "argocd.plateforme.com"  

      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = "argo-cd-argocd-server"
              port {
                number = 80  
              }
            }
          }
        }
      }
    }
  }

  depends_on = [helm_release.argo_cd]  
}

