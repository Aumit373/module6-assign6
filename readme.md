## It's recommended to use Docker Desktop's built-in Kubernetes via kubeadm

Just go to Settings → Kubernetes, enable it, and restart. This way, you can use LoadBalancer services without needing KIND or Minikube — similar to a real production setup.

````markdown
# 🚀 Kubernetes Deployment Guide (Using KIND) – Ostad Project

This guide explains how to set up a Kubernetes cluster using KIND, deploy services, enable Ingress, and access services externally.

---

## 📦 1. Create Cluster using KIND

We use a custom `kind-cluster.yaml` to expose NodePorts to host machine:

```yaml
# kind-cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 30080
      - containerPort: 30081
        hostPort: 30081
```
````

Then create the cluster:

```bash
kind create cluster --name ostad-cluster --config kind-cluster.yaml
```

---

## 🔐 2. Create Secrets (if required)

```bash
kubectl create secret generic mongo-secret \
  --from-literal=username=ostad \
  --from-literal=password=ostad \
  -n ostad
```

---

## 🌐 3. Install NGINX Ingress Controller (for KIND)

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/kind/deploy.yaml
```

Wait until controller pods are ready:

```bash
kubectl get pods -n ingress-nginx
```

---

## 🚀 4. Apply Your Kubernetes YAMLs

Apply your deployments, services, ingress, configmaps, etc.:

```bash
kubectl apply -f .
```

---

## ⚠️ Issue: External IP Not Available on KIND

### Problem:

KIND does not support external IP for LoadBalancer services by default. So:

```bash
kubectl get svc
# EXTERNAL-IP will always show <none>
```

---

## ✅ Workaround 1: Use `kubectl port-forward`

To access services locally without NodePort or LoadBalancer:

```bash
kubectl port-forward svc/ostad-server -n ostad 5050:5050
kubectl port-forward svc/mongo-express -n ostad 8081:8081
```

Then open:

- `http://localhost:5050` → Ostad Server
- `http://localhost:8081` → Mongo Express

---

## ✅ Workaround 2: Use NodePort with KIND Cluster

Modify your service YAML to use `NodePort`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ostad-server
  namespace: ostad
spec:
  type: NodePort
  selector:
    app: ostad-server
  ports:
    - protocol: TCP
      port: 5050
      targetPort: 5050
      nodePort: 30080
```

If your `kind-cluster.yaml` exposes `30080`, then you can access:

```
http://localhost:30080
```

---

## ✅ Workaround 3: Use `LoadBalancer` Type (Not Recommended on KIND)

If you're not using `NodePort`, you can try:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ostad-server
  namespace: ostad
spec:
  type: LoadBalancer
  selector:
    app: ostad-server
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
```

But on KIND, `EXTERNAL-IP` will stay `<none>` unless you use a MetalLB or similar external load balancer — which is complex.

---

## 📌 Recommendation:

| Method       | For KIND | External Access   |
| ------------ | -------- | ----------------- |
| NodePort     | ✅       | Via `hostPort`    |
| Port Forward | ✅       | Temporary Access  |
| LoadBalancer | ❌       | Needs MetalLB     |
| Ingress      | ✅       | With Host Mapping |

---

## 🌍 Ingress Setup

Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ostad-ingress
  namespace: ostad
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: ostad.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ostad-server
                port:
                  number: 5050
```

Then edit `/etc/hosts`:

```
127.0.0.1 ostad.local
```

Browse: `http://ostad.local`

---

## ✅ Final Tips

- Use `kubectl get all -n ostad` to view all running resources.
- Always check pod logs if something is not working.
- Use port-forward for temporary local testing.

---

🛡️ This README is designed for development and educational purposes on local KIND clusters.

-> docker destop,kubectl -> settings->kubarnetes-> kubeadm

-> namespace , secret, configmap,

-> deployyment,service .....

-> service (mongo :clusterIP) mongo-express : loadbalancer backend : loadbalancer UI : loadbalancer nginx-Ingress : etc/host -> local url


namespace.yaml - defines the name of the kluster
kind-cluster.yaml - containd the api version and the host and container ports

mongo-confimap - mongo configuration
secrets.yaml - contain the db passwords in base 64 encrypted user name and passwords which can be used in other files

mongo-service - service info with port numbers
mongo-deployments - contains the pod name, dockerimage path, number of replicated to be deployed and the call for mongodb username and password.

mongo-express-service - service info with port numbers
mongo-express-deployments - contains the pod name, dockerimage path, number of replicated to be deployed and the call for mongodb username and password.

ostad-backend-service - service info with port numbers
ostad-backend-deployments - contains the pod name, dockerimage path, number of replicated to be deployed and the call for mongodb username and password.

ostad-backend-service - service info with port numbers
ostad-backend-deployments - contains the pod name, dockerimage path, number of replicated to be deployed and the call for mongodb username and password.