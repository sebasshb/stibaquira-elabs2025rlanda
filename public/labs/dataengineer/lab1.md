# Laboratorio: Crear una Instancia RDS

##

En este laboratorio se le proporcionará un entorno en el cual ya está levantada una VPC completa (subnets, route table, internet gateway).
Su objetivo es crear una Instancia RDS a partir de la VPC proporcionada, la creación del security group para la RDS, y el RDS Subnet Group
necesario para la creación de la misma.

![image](https://raw.githubusercontent.com/sebasshb/lab-imgs/refs/heads/main/RDSArch.png)

## Creación del Security Group para RDS

##

Antes de proceder, tenemos que crear un security group para que se pueda acceder a la RDS
por medio del Puerto 1433.

##

1. Dirígete a VPC en la consola de AWS.

####

2. En el menú izquierdo, entra a la sección de "Security Groups".

####

3. Haz clic en "Crear grupo de seguridad".

####

4. Configura los siguientes campos:

####

* Nombre del grupo de seguridad: RDS-SecurityGroup
* Descripción: (Puedes dejarla en blanco)
* VPC: Elige Lab-VPC.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura001.png)

5. Baja a la sección de "Reglas de entrada" (Inbound Rules) y crea dos reglas:

####

 * Regla 1:
     * Tipo: Todo el tráfico
     * Origen: 0.0.0.0/0
 * Regla 1:
     * Tipo: MSSQL
     * Protocolo: TCP
     * Rango de puertos: 1433 (se pondrá automáticamente)
     * Origen: 0.0.0.0/0

##

1. Finalmente, haz clic en "Crear grupo de seguridad".

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura002.png)

## Creación del Subnet Group para RDS

##

Ahora procedemos a crear un Subnet Group para la Instancia RDS que vamos a desplegar.

##

1. En la consola de AWS, busca RDS y selecciona "Aurora and RDS".

####

2. En el menú izquierdo, en la parte de abajo, elige la opción "Subnet Groups".

####

3. Haz clic en la opción "Create DB Subnet Group".

####

4. Configura los siguientes campos:

####

 * Name: RDS-SubnetGroup
 * Description: (Opcional pero recomendable)
 * VPC: Elige Lab-VPC.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura01.png)

5. En la sección "Add Subnets":

####

 * Availability Zones: Elige us-east-1a y us-east-1b.
 * Subnets: Elige tus dos subnets correspondientes a las zonas de disponibilidad seleccionadas.

6. Finalmente, haz clic en "Create".

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura02.png)


## Creación de la Instancia RDS

##

1. En la consola de AWS, ve al buscador y escribe RDS. Selecciona la opción "Aurora and RDS".

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura1.png)

2. En la sección de "Aurora and RDS", en el menú izquierdo selecciona "Databases" y después haz clic en "Create Database".

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura2.png)

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura3.png)

3. En la configuración de la base de datos:

####

 * Choose a database creation method: Selecciona Standard create.
 * Engine type: Selecciona Microsoft SQL Server.
 * Database management type: Deja Amazon RDS tal cual como está.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura4.png)

4. Edition: Déjala por defecto en SQL Server Express Edition.

##

5. Engine Version: Déjala por defecto.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura5.png)

6. Templates: Elige Free Tier para este laboratorio.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura6.png)

7. Settings:

####

* DB instance identifier: lab-database
* Master username: Deja admin.
* Credentials Management: Pon Self Managed.
* Master password: #LabDBase3! (Confirma la contraseña)

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura7.png)

8. Instance configuration:

####

* DB instance class: Deja db.t3.micro.
* Storage type: Deja General Purpose SSD (gp2) (lo que te pone por default).

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura8.png)

9. Connectivity:

####

* Compute resource: Deja la opción Don't connect to an EC2 compute resource.
* Virtual private cloud (VPC): Pon tu Lab-VPC.
* DB Subnet Group: Deja la que creamos antes (RDS-SubnetGroup).
* Public access: Habilita la opción (Yes).
* VPC security group (firewall): Elige Choose existing y selecciona el RDS-SecurityGroup que creamos.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura9.png)

10. Availability Zone: Es importante que en este laboratorio dejes la Availability Zone en us-east-1b.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura10.png)

11. Baja y haz clic en "Create database".

##

## Verifica la creación de la RDS Instance

##

1. Si aparece un pop-up, haz clic en "Close".

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura11.png)

2. Verás que tu instancia RDS está creándose.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura12.png)

3. La instancia tardará unos minutos en crearse y estar en estado disponible. En Status saldrá Available cuando se haya creado satisfactoriamente.

##

4. En los detalles de la RDS, puedes verificar tu Endpoint para conectarte a la misma posteriormente. También verás a qué VPC está asociada con su subnet group y security group.

![image](https://raw.githubusercontent.com/sebasshb/Laboratorio-RDS/refs/heads/main/Captura13.png)

# ¡Felicidades!

##

Ha completado el laboratorio satisfactoriamente.

![image](https://raw.githubusercontent.com/sebasshb/lab-imgs/refs/heads/main/RDSFinalArch.png)