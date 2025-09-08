### Ver contenedores en ejecución
```shell
docker ps
```

### Ver logs en tiempo real
```shell
docker logs -f my-nodejs-app
```

### Detener el contenedor
```shell
docker stop my-nodejs-app
```

### Iniciarlo de nuevo
```shell
docker start my-nodejs-app
```

### Eliminar el contenedor
```shell
docker rm my-nodejs-app
```

### Reconstruir la imagen después de cambios
```shell
docker build -t nodejs-back-template .
```

### Ejecutar (crear y correr) un contenedor basado en la imagen
```shell
docker run -d -p 3000:3000 --name my-nodejs-app nodejs-back-template
```

### Construir la imagen del stage "development"
```shell
docker build -f Dockerfile.dev --target development -t nodejs-dev .
```

### Ejecutar el contenedor de desarrollo
```shell
docker run -d -p 3000:3000 --name my-nodejs-dev nodejs-dev
```

### Construir la imagen del stage "production"
```shell
docker build -f Dockerfile.dev --target production -t nodejs-prod .
```

### Ejecutar el contenedor de producción
```shell
docker run -d -p 3000:3000 --name my-nodejs-prod nodejs-prod
```
## docker-compose
##### En lugar de correr cada uno de estos comandos, aprovechamos que docker-compose junta todo esto en un archivo de configuración [docker-compose.yml](docker-compose.dev.yml)

```shell
### Iniciar todo el stack de desarrollo
docker-compose -f docker-compose.dev.yml up

### En background (daemon)
docker-compose -f docker-compose.dev.yml up -d

### Terminar todo (eliminando volumen v)
docker-compose -f docker-compose.dev.yml down -v
```