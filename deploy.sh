docker build -t kushalpichika/blog-backend:v1 ./Blog-api
docker push kushalpichika/blog-backend:v1

docker build -t kushalpichika/blog-frontend:v1 ./Blog-frontend
docker push kushalpichika/blog-frontend:v1

kubectl apply -f k8s/
