 # Multi Server Simulator


## Overview
This project is a simulator for M/M/C and M/G/C queuing systems. Users can input parameters such as arrival rate (λ), service rate (µ), model type (M/M/C or M/G/C), and the number of servers. Upon submitting the inputs, the simulator generates a comprehensive table with various queuing system metrics, followed by a Queuing Calculator Table and a Gantt chart for visualization.

Deployed project Link : https://m-m-1-umer.vercel.app/

To run locally write the following commands in Vs code terminal to run the project
```
git clone https://github.com/umershaikh123/priority-queue-simulator-p.git

cd priority-queue-simulator

npm install

npm run dev
```

## Usage
### 1. Input Parameters
Provide the following inputs:

- Arrival Rate (λ): Rate at which customers arrive.
- Service Rate (µ): Rate at which customers are served.
- Model Type: Choose between M/M/C or M/G/C.
- Number of Servers: Specify the number of servers.
Click the submit button to generate the main table.

### 2. Generated Table
The table includes the following columns:

- S.no#: Serial number.
- Cp Lookup: Lookup value for cumulative probability.
- Cumulative Probability (Cp): Cumulative probability of arrival.
- Avg Time Between Arrivals: Average time between arrivals.
- Inter Arrival Time: Time between consecutive arrivals.
- Arrival Time: Time at which a customer arrives.
- Service Time: Time taken to serve a customer.
- Start Time: Time at which service starts.
- End Time: Time at which service ends.
- Turnaround Time: Total time a customer spends in the system.
- Waiting Time: Time a customer waits in the queue.
- Response Time: Time taken to respond to a customer.
The number of rows and total customers are determined when cumulative probability reaches 1.

![image](https://github.com/umershaikh123/priority-queue-simulator-p/assets/42178214/93aab8dc-81ad-407d-ae09-4e93bfef1e13)


### 3. Queuing Calculator Table
Displays various metrics for the queuing system:

- Utilization Factor (ρ)
- Average Time a Customer Spends in the System (W)
- Average Time a Customer Spends Waiting in the Queue (Wq)
- Average Number of Customers in the Queue (Lq)
- Average Number of Customers in the System (L)
- Proportion of Time the Server is Idle (Idle)
- Average Turnaround Time
- Average Response Time
- Average Waiting Time

![image](https://github.com/umershaikh123/priority-queue-simulator-p/assets/42178214/3f24a57d-1337-4880-97cc-7b87841364b7)


### 4. Gantt Chart
Generates a Gantt chart for queuing system visualization.
![image](https://github.com/umershaikh123/priority-queue-simulator-p/assets/42178214/6874316e-7177-4a10-9ef9-fc660a544c5a)

