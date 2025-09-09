# ¿Qué es Kubernetes?

Kubernetes es un software de orquestación de contenedores de código abierto que simplifica la administración de contenedores a escala. Puede programar, ejecutar, iniciar y cerrar contenedores y automatizar las funciones de administración. Los desarrolladores obtienen los beneficios de la creación de contenedores a escala sin los gastos generales de administración.

![image](https://raw.githubusercontent.com/sebasshb/lab-imgs/refs/heads/main/Kubernetes%20Cluster%20(F.Blanco).png)

## ¿En que nos apoya Kubernetes?

* Supervisar el estado de los contenedores.
* Escalar los contenedores.
* Actualizar los contenedores con nuevas versiones.
* Equilibrar el tráfico entre las máquinas.

##

## ¿Qué es un cluster de Kubernetes?

Un clúster de Kubernetes es el conjunto de máquinas (nodos) que trabajan juntas para correr tus aplicaciones de forma organizada.

##

Se divide en dos partes principales:

##

### - Control Plane
* Decide qué corre y dónde. 
* Se encarga de la planificación, la comunicación y mantener todo en orden.

##

### - Worker Nodes
* Son las máquinas que ejecutan realmente los contenedores (tus apps).
* Cada nodo tiene un agente llamado kubelet que habla con el Control Plane (cerebro).

##

## ¿Qué es Amazon EKS?

Amazon Elastic Kubernetes Service (EKS) es un servicio de Kubernetes completamente administrado que elimina la complejidad que supone operar clústeres de Kubernetes.

##

## Iniciemos con EKS: 

Dentro del laboratorio encontrarás una VPC (vpc-lab-eks) junto a 2 subredes privadas y 2 subredes públicas donde utilizaremos las subredes privadas para crear las interfaces de red en la configuración del EKS.

![image](https://raw.githubusercontent.com/sebasshb/lab-imgs/refs/heads/main/eks.png)


# ¡Felicidades!

Ha completado el laboratorio de EKS satisfactoriamente.