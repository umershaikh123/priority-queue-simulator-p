"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Button,
  FormGroup,
  Stack,
  TextField,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"

import StyledButton from "@/components/Button"
import CssTextField from "@/components/TextField"
import * as d3 from "d3"

export default function Home() {
  const [arrivalRate, setArrivalRate] = useState(0)
  const [serviceRate, setServiceRate] = useState(0)
  const [cpValues, setCpValues] = useState([])
  const [cpLookupTable, setCpLookupTable] = useState([])
  const [AvgTime, setAvgTime] = useState([])
  const [interArrivalTimes, setInterArrivalTimes] = useState([])
  const [interArrivalTimesRand, setInterArrivalTimesRand] = useState([])
  const [arrivalTimes, setArrivalTimes] = useState([])
  const [serviceTimes, setServiceTimes] = useState([])
  const [startTimes, setstartTimes] = useState([])
  const [endTime, setendTime] = useState([])
  const [TurnaroundTime, setTurnaroundTime] = useState([])
  const [WaitTime, setWaitTime] = useState([])
  const [ResponseTime, setResponseTime] = useState([])
  const [Customers, setCustomers] = useState([])
  const [variance, setVariance] = useState(0)

  const [avgTurnaroundTime, setavgTurnaroundTime] = useState(0)
  const [avgWaitTime, setavgWaitTime] = useState(0)
  const [avgResponseTime, setavgResponseTime] = useState(0)

  const [MMCtableGenerated, setMMCtableGenerated] = useState(false)
  const [MGCtableGenerated, setMGCtableGenerated] = useState(false)
  const [GGCtableGenerated, setGGCtableGenerated] = useState(false)

  const [utilizationFactor, setutilizationFactor] = useState(0)
  const [avgTimeInSystem, setavgTimeInSystem] = useState(0)
  const [Idle, setIdle] = useState(0)
  const [avgTimeInQueue, setavgTimeInQueue] = useState(0)
  const [avgCustomersInQueue, setavgCustomersInQueue] = useState(0)
  const [avgCustomersInSystem, setavgCustomersInSystem] = useState(0)

  const [A, setA] = useState(55)
  const [a, seta] = useState(1)
  const [b, setb] = useState(3)
  const [z0, setz0] = useState(10112166)
  const [M, setM] = useState(1994)
  const [C, setC] = useState(9)

  const [modelType, setModelType] = useState(1)
  const [servers, setservers] = useState(1)
  const [minValue, setminValue] = useState(1)
  const [maxValue, setmaxValue] = useState(2)

  function prepareGanttData(customers) {
    return customers.map(customer => {
      return {
        customerNo: customer.customerNo,
        StartTime: customer.StartTime,
        EndTime: customer.EndTime,
        TurnaroundTime: customer.TurnaroundTime,
        WaitTime: customer.WaitTime,
        ResponseTime: customer.ResponseTime,
      }
    })
  }

  function QueueLengthViz({ customers }) {
    const svgRef = useRef(null)
    const [queueLengthData, setQueueLengthData] = useState([])

    useEffect(() => {
      const svg = d3.select(svgRef.current)

      const data = customers
      console.log("data", data)

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.EndTime)])
        .range([0, 1000])

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.EndTime)])
        .range([500, 0])

      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(d.StartTime))
        .attr("y", 550)
        .attr("width", d => xScale(d.EndTime) - xScale(d.StartTime) + 100)

        .attr("height", 50)

        .attr("fill", () => getRandomColor())

      svg
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => (xScale(d.StartTime) + xScale(d.EndTime) + 100) / 2)
        .attr("y", 580)

        .attr("fill", "white")
        .style("font-size", "11px")

        .text(d => `C${d.customerNo}`)

      const xAxis = d3.axisBottom(xScale)
      const yAxis = d3.axisLeft(yScale)

      svg.append("g").attr("transform", `translate(0, ${600})`).call(xAxis)

      svg.append("g").attr("transform", `translate(0, ${100})`).call(yAxis)

      svg
        .append("text")
        .attr("x", 500)
        .attr("y", 650)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Time")
    }, [customers])
    const getRandomColor = () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }
    const calculateYPosition = (data, index, yScale) => {
      const overlappingThreshold = 2

      if (index === 0) {
        return yScale(data[index].EndTime)
      }

      const previousEnd = data[index - 1].EndTime
      const currentStart = data[index].StartTime

      return Math.max(
        yScale(previousEnd) + overlappingThreshold,
        yScale(currentStart)
      )
    }

    return (
      <div>
        <svg ref={svgRef} width={1000} height={700} className=" ml-11" />
      </div>
    )
  }
  const handleModelChange = event => {
    setModelType(event.target.value)
  }

  const handleMinChange = event => {
    setminValue(event.target.value)
  }

  const handleMaxChange = event => {
    setmaxValue(event.target.value)
  }

  const handleServerChange = event => {
    setservers(event.target.value)
  }

  const handleArrivalRateChange = e => {
    setArrivalRate(e.target.value)
    saveValues()
  }
  const handleServiceRateChange = e => {
    setServiceRate(e.target.value)
    saveValues()
  }

  function poissonPDF(x, lambda) {
    if (x < 0 || lambda <= 0) {
      return 0
    }

    const factorialX =
      Math.exp(x * Math.log(x) - x - Math.log(2 * Math.PI)) *
      Math.sqrt(2 * Math.PI * x)

    return (Math.pow(lambda, x) * Math.exp(-lambda)) / factorialX
  }

  function expPDF(x, lambda) {
    if (x < 0 || lambda <= 0) {
      return 0
    }

    return lambda * Math.exp(-lambda * x)
  }

  function uniformPDF(x, min, max) {
    if (x < min || x > max) {
      return 0
    }

    return 1 / (max - min)
  }

  const saveValues = async () => {
    return new Promise((resolve, reject) => {
      const lambda = parseFloat(arrivalRate)

      let x = 0
      let cumulativeProbability = 0
      const calculatedCpValues = []
      const calculatedCpLookupTable = []

      if (modelType == 1) {
        console.log("m/m/c model")
        while (cumulativeProbability < 0.9999999) {
          const factorial = calculateFactorial(x)

          const probability =
            (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial

          cumulativeProbability += probability
          calculatedCpValues.push({ x, cumulativeProbability })
          calculatedCpLookupTable.push(cumulativeProbability)

          x++
        }
      } else if (modelType == 2) {
        console.log("m/g/c model")
        while (cumulativeProbability < 0.9999999) {
          const probability = lambda * Math.exp(-lambda * x)

          cumulativeProbability += probability
          calculatedCpValues.push({ x, cumulativeProbability })
          calculatedCpLookupTable.push(cumulativeProbability)

          x++
        }
      } else if (modelType == 3) {
        console.log("g/g/c model")
        while (cumulativeProbability < 0.9999999) {
          const probability = 1 / (maxValue - minValue)

          cumulativeProbability += probability
          calculatedCpValues.push({ x, cumulativeProbability })
          calculatedCpLookupTable.push(cumulativeProbability)

          x++
        }
      }

      calculatedCpLookupTable.unshift(0)

      setCpValues(calculatedCpValues)
      setCpLookupTable(calculatedCpLookupTable)

      resolve()
    })
  }

  const M_M_1_Table = async () => {
    const start_Time = []
    const End_Time = []
    const turnaround_Time = []
    const wait_Time = []
    const response_Time = []
    let currentTime = 0
    let totalWaitTime = 0
    let totalTurnaroundTime = 0

    const lambda = parseFloat(arrivalRate)
    const meu = parseFloat(serviceRate)
    if (isNaN(lambda) || lambda <= 0) {
      alert("Please enter a valid positive arrival rate (λ).")
      return
    }

    if (lambda >= meu) {
      alert("Please enter arrival rate (λ) less than mew (u).")
      return
    }

    const iATime = []
    const iATimeRandom = []
    let previousArrivalTime = 0
    iATime.push(0)
    iATimeRandom.push(0)
    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      AvgTime.push(i)
    }

    for (let i = 0; i < cpLookupTable.length - 2; i++) {
      const length = cpLookupTable.length - 2

      const U = Math.random()

      const interArrivalTime = -Math.log(U) / arrivalRate
      iATimeRandom.push(interArrivalTime)

      const findIndexInRange = (value, lowerBoundArray, upperBoundArray) => {
        console.log("lowerBoundArray[i]", lowerBoundArray[i])
        console.log(
          "upperBoundArray[i]",
          upperBoundArray[i].cumulativeProbability
        )

        for (let i = 0; i < upperBoundArray.length - 1; i++) {
          if (
            value >= lowerBoundArray[i] &&
            value < upperBoundArray[i].cumulativeProbability
          ) {
            return i
          }
        }

        return upperBoundArray.length - 1
      }
      const index = findIndexInRange(interArrivalTime, cpLookupTable, cpValues)
      console.log(" index ", index)

      iATime.push(index)
    }
    setInterArrivalTimes(iATime)
    setInterArrivalTimesRand(iATimeRandom)

    const ArrivalTimes = await Promise.all(
      iATime.map(async value => {
        const currentInterArrivalTime = value
        const arrival_Time = previousArrivalTime + currentInterArrivalTime
        previousArrivalTime = arrival_Time
        return arrival_Time
      })
    )

    setArrivalTimes(ArrivalTimes)

    const serTime = []
    const customer = []
    let TotalTurnaround = 0
    let TotalWaitTime = 0
    let TotalResponseTime = 0

    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      const length = cpLookupTable.length - 1

      const randomR = Math.round(Math.random() * length)

      serTime.push(randomR)
    }
    setServiceTimes(serTime)

    let startTime = 0
    let index = 1
    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      start_Time.push(startTime)

      const r1 = startTime + serTime[i]
      End_Time.push(r1)

      const r2 = End_Time[i] - ArrivalTimes[i]
      turnaround_Time.push(r2 > 0 ? r2 : -r2)

      const r3 = startTime - ArrivalTimes[i]
      wait_Time.push(r3 > 0 ? r3 : -r3)

      const r4 = wait_Time[i] + serTime[i]
      response_Time.push(r4 > 0 ? r4 : -r4)

      totalWaitTime += wait_Time[i]
      totalTurnaroundTime += turnaround_Time[i]

      TotalTurnaround += turnaround_Time[i]
      TotalResponseTime += response_Time[i]
      TotalWaitTime += wait_Time[i]

      startTime = End_Time[i]
      customer.push({
        customerNo: index + i,
        StartTime: startTime,
        EndTime: r1,
        TurnaroundTime: r2,
        WaitTime: r3,
        ResponseTime: r4,
      })
    }

    setCustomers(customer)

    const AvgTurnaround = TotalTurnaround / (cpLookupTable.length - 1)
    const AvgResponse = TotalResponseTime / (cpLookupTable.length - 1)
    const AvgWaitTime = TotalWaitTime / (cpLookupTable.length - 1)
    setavgTurnaroundTime(AvgTurnaround)
    setavgResponseTime(AvgResponse)
    setavgWaitTime(AvgWaitTime)

    setstartTimes(start_Time)
    setWaitTime(wait_Time)
    setTurnaroundTime(turnaround_Time)
    setendTime(End_Time)
    setResponseTime(response_Time)
    generateTableData()
    setMMCtableGenerated(true)

    const utilizationFactor = parseFloat(arrivalRate) / parseFloat(serviceRate)
    setutilizationFactor(utilizationFactor)

    const Lq =
      Math.pow(parseFloat(utilizationFactor), 2) /
      (1 - parseFloat(utilizationFactor))

    setavgCustomersInQueue(Lq)

    const Wq = Lq / parseFloat(arrivalRate)
    setavgTimeInQueue(Wq)

    const W = Wq + 1 / parseFloat(serviceRate)
    setavgTimeInSystem(W)

    const L = W * parseFloat(arrivalRate)
    setavgCustomersInSystem(L)

    const idle = 1 - utilizationFactor
    setIdle(idle)
  }

  const calculateFactorial = n => {
    if (n === 0) return 1
    let factorial = 1
    for (let i = 1; i <= n; i++) {
      factorial *= i
    }
    return factorial
  }
  const [tableData, setTableData] = useState([])
  const [priority, setpriority] = useState([])

  function mod(a, b) {
    return ((a % b) + b) % b
  }

  const generateTableData = () => {
    const data = []
    let Z = z0

    const e = mod(556169139, 1994)

    for (let i = 1; i <= cpLookupTable.length - 1; i++) {
      let R = 0

      const calc1 = A * Z
      const calc2 = parseInt(calc1) + parseInt(C)

      R = mod(calc2, parseInt(M))

      const randomNumber = Math.random()
      const Y = (b - a) * randomNumber + a
      const roundOff = Math.round(Y)

      data.push({ serialNo: i, Z, R, randomNumber, Y, roundOff })
      Z = R
    }

    setTableData(data)
  }

  const M_M_C_Table = async () => {
    const start_Time = []
    const End_Time = []
    const turnaround_Time = []
    const wait_Time = []
    const response_Time = []

    const lambda = parseFloat(arrivalRate)
    const meu = parseFloat(serviceRate)
    if (isNaN(lambda) || lambda <= 0) {
      alert("Please enter a valid positive arrival rate (λ).")
      return
    }

    if (lambda >= meu) {
      alert("Please enter arrival rate (λ) less than mew (u).")
      return
    }

    const iATime = []
    const iATimeRandom = []
    let previousArrivalTime = 0
    iATime.push(0)
    iATimeRandom.push(0)
    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      AvgTime.push(i)
    }

    for (let i = 0; i < cpLookupTable.length - 2; i++) {
      const length = cpLookupTable.length - 2

      const U = Math.random()

      const interArrivalTime = -Math.log(U) / arrivalRate
      iATimeRandom.push(interArrivalTime)

      const findIndexInRange = (value, lowerBoundArray, upperBoundArray) => {
        console.log("lowerBoundArray[i]", lowerBoundArray[i])
        console.log(
          "upperBoundArray[i]",
          upperBoundArray[i].cumulativeProbability
        )

        for (let i = 0; i < upperBoundArray.length - 1; i++) {
          if (
            value >= lowerBoundArray[i] &&
            value < upperBoundArray[i].cumulativeProbability
          ) {
            return i
          }
        }

        return upperBoundArray.length - 1
      }
      const index = findIndexInRange(interArrivalTime, cpLookupTable, cpValues)
      console.log(" index ", index)

      iATime.push(index)
    }
    setInterArrivalTimes(iATime)
    setInterArrivalTimesRand(iATimeRandom)

    const ArrivalTimes = await Promise.all(
      iATime.map(async value => {
        const currentInterArrivalTime = value
        const arrival_Time = previousArrivalTime + currentInterArrivalTime
        previousArrivalTime = arrival_Time
        return arrival_Time
      })
    )

    setArrivalTimes(ArrivalTimes)

    const serTime = []
    let TotalTurnaround = 0
    let TotalWaitTime = 0
    let TotalResponseTime = 0

    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      const length = cpLookupTable.length - 1

      const randomR = Math.round(Math.random() * length)

      serTime.push(randomR)
    }
    setServiceTimes(serTime)

    function mmcSchedule(arrivalTimes, serviceTimes, numServers) {
      if (
        !Array.isArray(arrivalTimes) ||
        !Array.isArray(serviceTimes) ||
        arrivalTimes.length !== serviceTimes.length ||
        numServers <= 0
      ) {
        throw new Error(
          "Invalid input: arrivalTimes and serviceTimes must be arrays of equal length, and numServers must be a positive number."
        )
      }

      const serverBusyTimes = new Array(numServers).fill(0)
      const customerTimes = []

      for (let i = 0; i < cpLookupTable.length - 1; i++) {
        const arrivalTime = arrivalTimes[i]
        const serviceTime = serviceTimes[i]

        const availableServer = serverBusyTimes.reduce(
          (minIndex, serverTime, index) =>
            serverTime < serverBusyTimes[minIndex] ? index : minIndex,
          0
        )

        const startTime = Math.max(
          arrivalTime,
          serverBusyTimes[availableServer]
        )
        const endTime = startTime + serviceTime

        const responseTime = startTime - arrivalTime

        const waitingTime = responseTime - arrivalTime

        const turnaroundTime = endTime - arrivalTime

        serverBusyTimes[availableServer] = endTime

        start_Time.push(startTime)
        End_Time.push(endTime)
        turnaround_Time.push(
          turnaroundTime > 0 ? turnaroundTime : -turnaroundTime
        )
        wait_Time.push(waitingTime > 0 ? waitingTime : -waitingTime)
        response_Time.push(responseTime > 0 ? responseTime : -responseTime)

        TotalTurnaround += turnaroundTime > 0 ? turnaroundTime : -turnaroundTime
        TotalResponseTime += responseTime > 0 ? responseTime : -responseTime
        TotalWaitTime += waitingTime > 0 ? waitingTime : -waitingTime

        customerTimes.push({
          startTime,
          endTime,
          responseTime,
          waitingTime,
          turnaroundTime,
        })
      }

      return customerTimes
    }

    const customerTimes = mmcSchedule(arrivalTimes, serviceTimes, servers)

    const AvgTurnaround = TotalTurnaround / (cpLookupTable.length - 1)
    const AvgResponse = TotalResponseTime / (cpLookupTable.length - 1)
    const AvgWaitTime = TotalWaitTime / (cpLookupTable.length - 1)
    setavgTurnaroundTime(AvgTurnaround)
    setavgResponseTime(AvgResponse)
    setavgWaitTime(AvgWaitTime)

    setstartTimes(start_Time)
    setWaitTime(wait_Time)
    setTurnaroundTime(turnaround_Time)
    setendTime(End_Time)
    setResponseTime(response_Time)
    generateTableData()
    setMMCtableGenerated(true)

    function mmcMetrics(arrivalRate, serviceRate, numServers) {
      if (arrivalRate <= 0 || serviceRate <= 0 || numServers <= 0) {
        throw new Error(
          "Invalid input: arrivalRate, serviceRate, and numServers must be positive values."
        )
      }

      const lambda = arrivalRate
      const mu = serviceRate
      const c = numServers

      const c2 = c * c
      const cmu = c * mu
      const lambda2 = lambda * lambda

      const Lq = (lambda * (c2 - c)) / (cmu - lambda2 + 2 * cmu)
      const L = lambda / (cmu - lambda2)
      const W = L / lambda
      const Wq = Lq / lambda
      const rho = lambda / cmu
      const eta = 1 - rho

      return {
        Lq,
        L,
        W,
        Wq,
        rho,
        eta,
      }
    }

    const metrics = mmcMetrics(
      parseFloat(arrivalRate),
      parseFloat(serviceRate),
      servers
    )
    console.log("Average queue length:", metrics.Lq)
    setavgCustomersInQueue(metrics.Lq)
    console.log("Average system length:", metrics.L)
    setavgCustomersInSystem(metrics.L)
    console.log("Average time in system:", metrics.W)
    setavgTimeInSystem(metrics.W)
    console.log("Average waiting time:", metrics.Wq)
    setavgTimeInQueue(metrics.Wq)
    console.log("Utilization factor:", metrics.rho)
    setutilizationFactor(metrics.rho)
    console.log("Idle factor:", metrics.eta)
    setIdle(metrics.eta)
  }

  const M_G_1_Table = async () => {
    const start_Time = []
    const End_Time = []
    const turnaround_Time = []
    const wait_Time = []
    const response_Time = []

    const lambda = parseFloat(arrivalRate)
    const meu = parseFloat(serviceRate)
    if (isNaN(lambda) || lambda <= 0) {
      alert("Please enter a valid positive arrival rate (λ).")
      return
    }

    if (lambda >= meu) {
      alert("Please enter arrival rate (λ) less than mew (u).")
      return
    }

    const iATime = []
    const iATimeRandom = []
    let previousArrivalTime = 0
    iATime.push(0)
    iATimeRandom.push(0)
    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      AvgTime.push(i)
    }

    for (let i = 0; i < cpLookupTable.length - 2; i++) {
      const length = cpLookupTable.length - 2

      const U = Math.random()

      const interArrivalTime = -Math.log(U) / arrivalRate
      iATimeRandom.push(interArrivalTime)

      const findIndexInRange = (value, lowerBoundArray, upperBoundArray) => {
        console.log("lowerBoundArray[i]", lowerBoundArray[i])
        console.log(
          "upperBoundArray[i]",
          upperBoundArray[i].cumulativeProbability
        )

        for (let i = 0; i < upperBoundArray.length - 1; i++) {
          if (
            value >= lowerBoundArray[i] &&
            value < upperBoundArray[i].cumulativeProbability
          ) {
            return i
          }
        }

        return upperBoundArray.length - 1
      }
      const index = findIndexInRange(interArrivalTime, cpLookupTable, cpValues)
      console.log(" index ", index)

      iATime.push(index)
    }
    setInterArrivalTimes(iATime)
    setInterArrivalTimesRand(iATimeRandom)

    const ArrivalTimes = await Promise.all(
      iATime.map(async value => {
        const currentInterArrivalTime = value
        const arrival_Time = previousArrivalTime + currentInterArrivalTime
        previousArrivalTime = arrival_Time
        return arrival_Time
      })
    )

    setArrivalTimes(ArrivalTimes)

    const serTime = []
    let TotalTurnaround = 0
    let TotalWaitTime = 0
    let TotalResponseTime = 0

    for (let i = 0; i < cpLookupTable.length - 1; i++) {
      const length = cpLookupTable.length - 1

      const randomR = Math.round(Math.random() * length)

      serTime.push(randomR)
    }
    setServiceTimes(serTime)

    function mmcSchedule(numServers) {
      if (
        !Array.isArray(arrivalTimes) ||
        !Array.isArray(serviceTimes) ||
        arrivalTimes.length !== serviceTimes.length ||
        numServers <= 0
      ) {
        throw new Error(
          "Invalid input: arrivalTimes and serviceTimes must be arrays of equal length, and numServers must be a positive number."
        )
      }

      const serverBusyTimes = new Array(numServers).fill(0)
      const customerTimes = []

      for (let i = 0; i < cpLookupTable.length - 1; i++) {
        const arrivalTime = arrivalTimes[i]
        const serviceTime = serviceTimes[i]

        const availableServer = serverBusyTimes.reduce(
          (minIndex, serverTime, index) =>
            serverTime < serverBusyTimes[minIndex] ? index : minIndex,
          0
        )

        const startTime = Math.max(
          arrivalTime,
          serverBusyTimes[availableServer]
        )
        const endTime = startTime + serviceTime

        const responseTime = startTime - arrivalTime

        const waitingTime = responseTime - arrivalTime

        const turnaroundTime = endTime - arrivalTime

        serverBusyTimes[availableServer] = endTime

        start_Time.push(startTime)
        End_Time.push(endTime)
        turnaround_Time.push(
          turnaroundTime > 0 ? turnaroundTime : -turnaroundTime
        )
        wait_Time.push(waitingTime > 0 ? waitingTime : -waitingTime)
        response_Time.push(responseTime > 0 ? responseTime : -responseTime)

        TotalTurnaround += turnaroundTime > 0 ? turnaroundTime : -turnaroundTime
        TotalResponseTime += responseTime > 0 ? responseTime : -responseTime
        TotalWaitTime += waitingTime > 0 ? waitingTime : -waitingTime

        customerTimes.push({
          startTime,
          endTime,
          responseTime,
          waitingTime,
          turnaroundTime,
        })
      }

      return customerTimes
    }

    const customerTimes = mmcSchedule(servers)

    const AvgTurnaround = TotalTurnaround / (cpLookupTable.length - 1)
    const AvgResponse = TotalResponseTime / (cpLookupTable.length - 1)
    const AvgWaitTime = TotalWaitTime / (cpLookupTable.length - 1)
    setavgTurnaroundTime(AvgTurnaround)
    setavgResponseTime(AvgResponse)
    setavgWaitTime(AvgWaitTime)

    setstartTimes(start_Time)
    setWaitTime(wait_Time)
    setTurnaroundTime(turnaround_Time)
    setendTime(End_Time)
    setResponseTime(response_Time)
    generateTableData()
    setMGCtableGenerated(true)

    function mgcMetrics(
      arrivalRate,
      serviceRate,
      serviceMin,
      serviceMax,
      numServers
    ) {
      if (
        arrivalRate <= 0 ||
        serviceMin >= serviceMax ||
        serviceMin <= 0 ||
        numServers <= 0
      ) {
        throw new Error("Invalid input: serviceMin < serviceMax.")
      }
      const c = numServers
      const lambda = arrivalRate
      const rho = lambda / (c * serviceRate)
      const Variance = Math.pow(serviceMax - serviceMin, 2) / 12

      const Lq =
        ((Math.pow(arrivalRate, 2) * Math.pow(Variance, 2) + Math.pow(rho, 2)) /
          2) *
        (1 - rho)

      const Wq = Lq / arrivalRate
      const W = Wq + 1 / serviceRate

      const L = Lq + lambda * W

      const eta = 1 - rho
      return {
        Variance,
        rho,
        W,
        Wq,
        L,
        Lq,
        eta,
      }
    }

    const metrics = mgcMetrics(
      parseFloat(arrivalRate),
      parseFloat(serviceRate),
      minValue,
      maxValue,
      servers
    )
    console.log("Variance:", metrics.Variance)
    setVariance(metrics.Variance)
    console.log("Average queue length:", metrics.Lq)
    setavgCustomersInQueue(metrics.Lq)
    console.log("Average system length:", metrics.L)
    setavgCustomersInSystem(metrics.L)
    console.log("Average time in system:", metrics.W)
    setavgTimeInSystem(metrics.W)
    console.log("Average waiting time:", metrics.Wq)
    setavgTimeInQueue(metrics.Wq)
    console.log("Utilization factor:", metrics.rho)
    setutilizationFactor(metrics.rho)
    console.log("Idle factor:", metrics.eta)
    setIdle(metrics.eta)
  }
  return (
    <div className=" flex flex-col  justify-center items-center space-y-8 mt-4">
      <div className=" justify-center">
        <h1 className="text-3xl font-bold text-[]">Simulator</h1>
      </div>

      {/* Inputs */}

      <div className=" flex font-medium space-x-12 ">
        <div className=" flex-col ">
          <CssTextField
            label="lambda λ"
            variant="outlined"
            type="number"
            value={arrivalRate}
            onChange={handleArrivalRateChange}
          />
          <p>Arrival Rate</p>
        </div>

        <div className=" flex-col ">
          <CssTextField
            label="mu µ"
            variant="outlined"
            type="number"
            value={serviceRate}
            onChange={handleServiceRateChange}
          />
          <p>Service Rate</p>
        </div>

        <div className=" flex-col ">
          <Box
            sx={{
              "& label.Mui-focused": {
                transition: "all 0.3s ease-in-out",
                color: "#0394FF",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  transition: "all 0.3s ease-in-out",
                  borderColor: "#000000",
                },
                "&.Mui-focused fieldset": {
                  transition: "all 0.3s ease-in-out",
                  color: "#0394FF",
                  border: "1px solid",
                },
              },
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Model</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={modelType}
                fullWidth={true}
                label="Model"
                onChange={handleModelChange}
                sx={{ width: "14rem" }}
              >
                <MenuItem value={1}>M/M/C</MenuItem>
                <MenuItem value={2}>M/G/C</MenuItem>
                {/* <MenuItem value={3}>G/G/C</MenuItem> */}
              </Select>
            </FormControl>
          </Box>

          <p>Model Type</p>
        </div>

        <div className=" flex-col ">
          <CssTextField
            label="servers"
            variant="outlined"
            type="number"
            value={servers}
            onChange={handleServerChange}
          />
          <p>No of Servers</p>
        </div>
      </div>

      {modelType === 1 && (
        <>
          {servers == 1 ? (
            <>
              <div className="flex">
                <StyledButton
                  onClick={M_M_1_Table}
                  color="#004021"
                  background="#076638"
                >
                  Submit
                </StyledButton>
              </div>
            </>
          ) : (
            <>
              <div className="flex">
                <StyledButton
                  onClick={M_M_C_Table}
                  color="#004021"
                  background="#076638"
                >
                  Submit
                </StyledButton>
              </div>
            </>
          )}
        </>
      )}

      {modelType === 2 && (
        <>
          <div className="flex space-x-5">
            <div className=" flex-col">
              <CssTextField
                label="a"
                sx={{ width: "5rem" }}
                variant="outlined"
                type="number"
                value={minValue}
                onChange={handleMinChange}
              />
              <p>min value</p>
            </div>

            <div className=" flex-col">
              <CssTextField
                label="b"
                sx={{ width: "5rem" }}
                variant="outlined"
                type="number"
                value={maxValue}
                onChange={handleMaxChange}
              />
              <p>max value</p>
            </div>
          </div>
          <>
            {servers == 1 ? (
              <>
                <div className="flex">
                  <StyledButton
                    onClick={M_G_1_Table}
                    color="#004021"
                    background="#076638"
                  >
                    Submit
                  </StyledButton>
                </div>
              </>
            ) : (
              <>
                <div className="flex">
                  <StyledButton
                    onClick={M_G_1_Table}
                    color="#004021"
                    background="#076638"
                  >
                    Submit
                  </StyledButton>
                </div>
              </>
            )}
          </>
        </>
      )}

      {MMCtableGenerated && modelType == 1 && servers > 0 && (
        <div>
          <div className=" flex w-full  text-3xl  font-bold  justify-center items-center">
            M/M/{servers} TABLE
          </div>
          <table className=" w-[90vw] mt-4 mb-7">
            <thead>
              <tr>
                <th className=" text-white  px-4 ">S.no#</th>
                <th className=" text-white  px-4">Cp Lookup</th>
                <th className=" text-white  px-4">
                  Cumulative Probability (Cp)
                </th>
                <th className=" text-white  px-4">Avg Time Between Arrivals</th>
                <th className=" text-white  px-4">Rand No</th>
                <th className=" text-white  px-4">Inter Arrival Time</th>
                <th className=" text-white  px-4">Arrival Time</th>
                <th className=" text-white  px-4">Service Time</th>
                <th className=" text-white  px-4">Start Time</th>
                <th className=" text-white  px-4">End Time</th>
                <th className=" text-white  px-4">Turnaround Time</th>
                <th className=" text-white  px-4">Waiting Time</th>
                <th className=" text-white  px-4">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {cpValues.map((value, index) => (
                <tr key={index}>
                  <td className="  px-4">{value.x + 1}</td>
                  <td className="  px-4">{cpLookupTable[index].toFixed(6)}</td>
                  <td className="  px-4">
                    {value.cumulativeProbability.toFixed(6)}
                  </td>
                  <td className="  px-4">{value.x}</td>
                  <td className="  px-4">
                    {interArrivalTimesRand[index].toFixed(4)}
                  </td>
                  <td className="  px-4">{interArrivalTimes[index] || 0}</td>
                  <td className="  px-4">{arrivalTimes[index] || 0}</td>
                  <td className="  px-4">{serviceTimes[index] || 1}</td>

                  <td
                    className={`px-4 ${
                      startTimes[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {startTimes[index] || 0}
                  </td>
                  <td
                    className={`px-4 ${
                      endTime[index] < 0 ? "text-red-500" : "text-black"
                    }`}
                  >
                    {endTime[index] || 1}
                  </td>
                  <td
                    className={`px-4 ${
                      TurnaroundTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {TurnaroundTime[index] || 0}
                  </td>
                  <td
                    className={`px-4 ${
                      WaitTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {WaitTime[index] || 1}
                  </td>
                  <td
                    className={`px-4 ${
                      ResponseTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {ResponseTime[index] || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h1 className="w-full   text-3xl font-semibold justify-center items-center flex">
              Queuing Calculator
            </h1>
            <table className="w-full mt-4 mb-7 text-left">
              <tr>
                <th className="text-left text-white px-4">Metric</th>
                <th className="text-white px-4">Value</th>
              </tr>
              <tr>
                <td className="text-left px-4"> Utilization Factor (ρ)</td>
                <td className="px-4">{utilizationFactor.toFixed(2) * 100} %</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Time a Customer Spends in the System (W){" "}
                </td>
                <td className="px-4">{avgTimeInSystem.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Time a Customer Spends Waiting in the Queue (Wq){" "}
                </td>
                <td className="px-4">{avgTimeInQueue.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Number of Customers in the Queue (Lq){" "}
                </td>
                <td className="px-4">{avgCustomersInQueue.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Number of Customers in the System (L){" "}
                </td>
                <td className="px-4">{avgCustomersInSystem.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4">
                  {" "}
                  Proportion of time the server is idle (Idle){" "}
                </td>
                <td className="px-4">{Idle.toFixed(2) * 100} %</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Turnaround Time</td>
                <td className="px-4">{avgTurnaroundTime.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Response Time</td>
                <td className="px-4">{avgResponseTime.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Waiting Time</td>
                <td className="px-4">{avgWaitTime.toFixed(3)}</td>
              </tr>
            </table>
            <h1 className="w-full   text-3xl font-semibold justify-center items-center flex">
              Gantt Chart
            </h1>

            <div className=" flex justify-center">
              <QueueLengthViz customers={Customers} />
            </div>
          </div>
        </div>
      )}

      {MGCtableGenerated && modelType == 2 && servers > 0 && (
        <div>
          <div className=" flex w-full  text-3xl  font-bold  justify-center items-center">
            M/G/{servers} TABLE
          </div>
          <table className=" w-[90vw] mt-4 mb-7">
            <thead>
              <tr>
                <th className=" text-white  px-4 ">S.no#</th>
                <th className=" text-white  px-4">Cp Lookup</th>
                <th className=" text-white  px-4">
                  Cumulative Probability (Cp)
                </th>
                <th className=" text-white  px-4">Avg Time Between Arrivals</th>
                <th className=" text-white  px-4">Rand No</th>
                <th className=" text-white  px-4">Inter Arrival Time</th>
                <th className=" text-white  px-4">Arrival Time</th>
                <th className=" text-white  px-4">Service Time</th>
                <th className=" text-white  px-4">Start Time</th>
                <th className=" text-white  px-4">End Time</th>
                <th className=" text-white  px-4">Turnaround Time</th>
                <th className=" text-white  px-4">Waiting Time</th>
                <th className=" text-white  px-4">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {cpValues.map((value, index) => (
                <tr key={index}>
                  <td className="  px-4">{value.x + 1}</td>
                  <td className="  px-4">{cpLookupTable[index].toFixed(6)}</td>
                  <td className="  px-4">
                    {value.cumulativeProbability.toFixed(6)}
                  </td>
                  <td className="  px-4">{value.x}</td>
                  <td className="  px-4">
                    {interArrivalTimesRand[index] !== undefined
                      ? interArrivalTimesRand[index].toFixed(4)
                      : "N/A"}
                  </td>
                  <td className="  px-4">{interArrivalTimes[index] || 0}</td>
                  <td className="  px-4">{arrivalTimes[index] || 0}</td>
                  <td className="  px-4">{serviceTimes[index] || 1}</td>

                  <td
                    className={`px-4 ${
                      startTimes[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {startTimes[index] || 0}
                  </td>
                  <td
                    className={`px-4 ${
                      endTime[index] < 0 ? "text-red-500" : "text-black"
                    }`}
                  >
                    {endTime[index] || 1}
                  </td>
                  <td
                    className={`px-4 ${
                      TurnaroundTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {TurnaroundTime[index] || 0}
                  </td>
                  <td
                    className={`px-4 ${
                      WaitTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {WaitTime[index] || 1}
                  </td>
                  <td
                    className={`px-4 ${
                      ResponseTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {ResponseTime[index] || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h1 className="w-full   text-3xl font-semibold justify-center items-center flex">
              Queuing Calculator
            </h1>
            <table className="w-full mt-4 mb-7 text-left">
              <tr>
                <th className="text-left text-white px-4">Metric</th>
                <th className="text-white px-4">Value</th>
              </tr>
              <tr>
                <td className="text-left px-4"> Utilization Factor (ρ)</td>
                <td className="px-4">{utilizationFactor.toFixed(2) * 100} %</td>
              </tr>
              <tr>
                <td className="text-left px-4"> Variance</td>
                <td className="px-4">{variance.toFixed(4)} </td>
              </tr>

              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Time a Customer Spends in the System (W){" "}
                </td>
                <td className="px-4">{avgTimeInSystem.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Time a Customer Spends Waiting in the Queue (Wq){" "}
                </td>
                <td className="px-4">{avgTimeInQueue.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Number of Customers in the Queue (Lq){" "}
                </td>
                <td className="px-4">{avgCustomersInQueue.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Number of Customers in the System (L){" "}
                </td>
                <td className="px-4">{avgCustomersInSystem.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4">
                  {" "}
                  Proportion of time the server is idle (Idle){" "}
                </td>
                <td className="px-4">{Idle.toFixed(2) * 100} %</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Turnaround Time</td>
                <td className="px-4">{avgTurnaroundTime.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Response Time</td>
                <td className="px-4">{avgResponseTime.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Waiting Time</td>
                <td className="px-4">{avgWaitTime.toFixed(3)}</td>
              </tr>
            </table>
            <h1 className="w-full   text-3xl font-semibold justify-center items-center flex">
              Gantt Chart
            </h1>

            <div className=" flex justify-center">
              <QueueLengthViz customers={Customers} />
            </div>
          </div>
        </div>
      )}

      {GGCtableGenerated && modelType == 1 && servers > 0 && (
        <div>
          <div className=" flex w-full  text-3xl  font-bold  justify-center items-center">
            G/G/{servers} TABLE
          </div>
          <table className=" w-[90vw] mt-4 mb-7">
            <thead>
              <tr>
                <th className=" text-white  px-4 ">S.no#</th>
                <th className=" text-white  px-4">Cp Lookup</th>
                <th className=" text-white  px-4">
                  Cumulative Probability (Cp)
                </th>
                <th className=" text-white  px-4">Avg Time Between Arrivals</th>
                <th className=" text-white  px-4">Rand No</th>
                <th className=" text-white  px-4">Inter Arrival Time</th>
                <th className=" text-white  px-4">Arrival Time</th>
                <th className=" text-white  px-4">Service Time</th>
                <th className=" text-white  px-4">Start Time</th>
                <th className=" text-white  px-4">End Time</th>
                <th className=" text-white  px-4">Turnaround Time</th>
                <th className=" text-white  px-4">Waiting Time</th>
                <th className=" text-white  px-4">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {cpValues.map((value, index) => (
                <tr key={index}>
                  <td className="  px-4">{value.x + 1}</td>
                  <td className="  px-4">{cpLookupTable[index].toFixed(6)}</td>
                  <td className="  px-4">
                    {value.cumulativeProbability.toFixed(6)}
                  </td>
                  <td className="  px-4">{value.x}</td>
                  <td className="  px-4">
                    {interArrivalTimesRand[index].toFixed(4)}
                  </td>
                  <td className="  px-4">{interArrivalTimes[index] || 0}</td>
                  <td className="  px-4">{arrivalTimes[index] || 0}</td>
                  <td className="  px-4">{serviceTimes[index] || 1}</td>

                  <td
                    className={`px-4 ${
                      startTimes[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {startTimes[index] || 0}
                  </td>
                  <td
                    className={`px-4 ${
                      endTime[index] < 0 ? "text-red-500" : "text-black"
                    }`}
                  >
                    {endTime[index] || 1}
                  </td>
                  <td
                    className={`px-4 ${
                      TurnaroundTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {TurnaroundTime[index] || 0}
                  </td>
                  <td
                    className={`px-4 ${
                      WaitTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {WaitTime[index] || 1}
                  </td>
                  <td
                    className={`px-4 ${
                      ResponseTime[index] < 0 ? "text-red-500" : ""
                    }`}
                  >
                    {ResponseTime[index] || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h1>Queuing Calculator</h1>
            <table className="w-full mt-4 mb-7 text-left">
              <tr>
                <th className="text-left text-white px-4">Metric</th>
                <th className="text-white px-4">Value</th>
              </tr>
              <tr>
                <td className="text-left px-4"> Utilization Factor (ρ)</td>
                <td className="px-4">{utilizationFactor.toFixed(2) * 100} %</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Time a Customer Spends in the System (W){" "}
                </td>
                <td className="px-4">{avgTimeInSystem.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Time a Customer Spends Waiting in the Queue (Wq){" "}
                </td>
                <td className="px-4">{avgTimeInQueue.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Number of Customers in the Queue (Lq){" "}
                </td>
                <td className="px-4">{avgCustomersInQueue.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="text-left px-4">
                  {" "}
                  Average Number of Customers in the System (L){" "}
                </td>
                <td className="px-4">{avgCustomersInSystem.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4">
                  {" "}
                  Proportion of time the server is idle (Idle){" "}
                </td>
                <td className="px-4">{Idle.toFixed(2) * 100} %</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Turnaround Time</td>
                <td className="px-4">{avgTurnaroundTime.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Response Time</td>
                <td className="px-4">{avgResponseTime.toFixed(3)}</td>
              </tr>

              <tr>
                <td className="text-left px-4"> Average Waiting Time</td>
                <td className="px-4">{avgWaitTime.toFixed(3)}</td>
              </tr>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
