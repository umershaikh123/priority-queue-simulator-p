"use client"

import React, { useState, useEffect } from "react"
import {
  Button,
  FormGroup,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material"

import StyledButton from "@/components/Button"
import CssTextField from "@/components/TextField"

const PriorityTable = ({ A, a, b, z0, M, C, Length }) => {
  const [tableData, setTableData] = useState([])
  const [tableGenerated, setTableGenerated] = useState(false)
  const generateTableData = () => {
    const data = []
    let Z = z0

    for (let i = 1; i <= Length.TableLength; i++) {
      const R = (A * Z + C) % M
      const randomNumber = Math.random()
      const Y = (b - a) * randomNumber + a
      const roundOff = Math.floor(Y)
      data.push({ serialNo: i, Z, R, randomNumber, Y, roundOff })
      Z = R
    }

    setTableData(data)
    setTableGenerated(true)
  }

  // useEffect(() => {
  //   const generateTableData = () => {
  //     const data = []
  //     let Z = z0
  //     console.log("Length = ", Length.TableLength)
  //     for (let i = 1; i <= Length; i++) {
  //       const R = (A * Z + C) % M
  //       const randomNumber = Math.random()
  //       const Y = ((b - a) * randomNumber + a).toFixed(1)
  //       data.push({ serialNo: i, Z, R, randomNumber, Y })
  //       Z = R
  //     }

  //     setTableData(data)
  //   }

  // }, [A, a, b, z0, M, C])

  return (
    <div>
      <div className=" flex justify-center  items-center">
        <StyledButton
          onClick={generateTableData}
          color="#004021"
          background="#076638"
        >
          Submit
        </StyledButton>
      </div>

      {tableGenerated && (
        <>
          <h1 className="text-2xl font-medium">Priority Table</h1>
          <table className="w-full mt-4 mb-7 text-left">
            <thead>
              <tr>
                <th className="px-4">Serial No</th>
                <th className="px-4">Z iteration</th>
                <th className="px-4">R</th>
                <th className="px-4">Random Number</th>
                <th className="px-4">Priority</th>
                <th className="px-4">Priority Round Off</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.serialNo}>
                  <td className="px-4">{row.serialNo}</td>
                  <td className="px-4">{row.Z}</td>
                  <td className="px-4">{row.R}</td>
                  <td className="px-4">{row.randomNumber.toFixed(6)}</td>
                  <td className="px-4">{row.Y}</td>
                  <td className="px-4">{row.roundOff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

function Priority(TableLength) {
  const [A, setA] = useState(0)
  const [a, seta] = useState(0)
  const [b, setb] = useState(0)
  const [z0, setz0] = useState(0)
  const [M, setM] = useState(0)
  const [C, setC] = useState(0)

  const handleA = e => {
    setA(parseFloat(e.target.value))
  }

  const handleb = e => {
    setb(e.target.value)
  }

  const handlea = e => {
    seta(e.target.value)
  }

  const handleC = e => {
    setC(e.target.value)
  }

  const handleM = e => {
    setM(e.target.value)
  }

  const handleZ0 = e => {
    setz0(e.target.value)
  }

  return (
    <>
      <h1 className="text-2xl font-medium">Priority Inputs</h1>

      <div className=" flex font-medium space-x-12 ">
        <div className=" flex-col ">
          <CssTextField
            label="A"
            variant="outlined"
            type="number"
            value={A}
            onChange={handleA}
          />
          <p>A</p>
        </div>

        <div className=" flex-col ">
          <CssTextField
            label="M"
            variant="outlined"
            type="number"
            value={M}
            onChange={handleM}
          />
          <p>M</p>
        </div>

        <div className=" flex-col ">
          <CssTextField
            label="Z0"
            variant="outlined"
            type="number"
            value={z0}
            onChange={handleZ0}
          />
          <p>Z0</p>
        </div>
      </div>

      <div className=" flex font-medium space-x-12 ">
        <div className=" flex-col ">
          <CssTextField
            label="C"
            variant="outlined"
            type="number"
            value={C}
            onChange={handleC}
          />
          <p>C</p>
        </div>

        <div className=" flex-col ">
          <CssTextField
            label="a"
            variant="outlined"
            type="number"
            value={a}
            onChange={handlea}
          />
          <p>a</p>
        </div>

        <div className=" flex-col ">
          <CssTextField
            label="b"
            variant="outlined"
            type="number"
            value={b}
            onChange={handleb}
          />
          <p>b</p>
        </div>
      </div>

      <PriorityTable
        A={A}
        a={a}
        b={b}
        z0={z0}
        M={M}
        C={C}
        Length={TableLength}
      />
    </>
  )
}

export default function Home() {
  const [arrivalRate, setArrivalRate] = useState(0)
  const [serviceRate, setServiceRate] = useState(0)
  const [cpValues, setCpValues] = useState([])
  const [cpLookupTable, setCpLookupTable] = useState([])
  const [interArrivalTimes, setInterArrivalTimes] = useState([])
  const [arrivalTimes, setArrivalTimes] = useState([])
  const [serviceTimes, setServiceTimes] = useState([])
  const [tableGenerated, setTableGenerated] = useState(false)

  const [utilizationFactor, setutilizationFactor] = useState(0)
  const [avgTimeInSystem, setavgTimeInSystem] = useState(0)
  const [avgTimeInQueue, setavgTimeInQueue] = useState(0)
  const [avgCustomersInQueue, setavgCustomersInQueue] = useState(0)
  const [avgCustomersInSystem, setavgCustomersInSystem] = useState(0)

  const handleArrivalRateChange = e => {
    setArrivalRate(e.target.value)
  }
  const handleServiceRateChange = e => {
    setServiceRate(e.target.value)
  }

  const saveValues = () => {
    return new Promise((resolve, reject) => {
      const lambda = parseFloat(arrivalRate)
      if (isNaN(lambda) || lambda <= 0) {
        alert("Please enter a valid positive arrival rate (λ).")
        return
      }

      let x = 0
      let cumulativeProbability = 0
      const calculatedCpValues = []
      const calculatedCpLookupTable = []

      while (cumulativeProbability < 0.9999999) {
        const factorial = calculateFactorial(x)
        const probability =
          (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial
        cumulativeProbability += probability
        calculatedCpValues.push({ x, cumulativeProbability })
        calculatedCpLookupTable.push(cumulativeProbability)
        x++
      }

      calculatedCpLookupTable.unshift(0)

      setCpValues(calculatedCpValues)
      setCpLookupTable(calculatedCpLookupTable)
      resolve()
    })
  }

  const generatePriorityTable = async () => {
    const lambda = parseFloat(arrivalRate)
    if (isNaN(lambda) || lambda <= 0) {
      alert("Please enter a valid positive arrival rate (λ).")
      return
    }

    const iATime = []
    let previousArrivalTime = 0

    for (let i = 0; i < cpLookupTable.length; i++) {
      const randomIndex = Math.floor(Math.random() * cpLookupTable.length)
      iATime.push(randomIndex)
    }
    setInterArrivalTimes(iATime)

    const arrivalTimes = await Promise.all(
      iATime.map(async value => {
        const currentInterArrivalTime = value
        const arrivalTime = previousArrivalTime + currentInterArrivalTime
        previousArrivalTime = arrivalTime
        return arrivalTime
      })
    )

    setArrivalTimes(arrivalTimes)

    const serTime = []
    for (let i = 0; i < cpLookupTable.length; i++) {
      const serviceTime = Math.ceil(-serviceRate * Math.log(Math.random()))
      serTime.push(serviceTime)
    }
    setServiceTimes(serTime)

    // console.log("arrivalRate ", arrivalRate)
    // console.log("serviceRate ", serviceRate)
    // console.log("cpValues", cpValues)
    // console.log("cpLookupTable ", cpLookupTable)
    // console.log("interArrivalTimes ", interArrivalTimes)
    // console.log("arrivalTimes ", arrivalTimes)
    // console.log("serviceTimes ", serviceTimes)
    // console.log("tableGenerated ", tableGenerated)
    setTableGenerated(true)

    // Calculate Utilization Factor (ρ)
    setutilizationFactor(parseFloat(arrivalRate) / parseFloat(serviceRate))

    // Calculate Average Time a Customer Spends in the System (W)
    // setavgTimeInSystem(
    //   utilizationFactor > 0
    //     ? 1 / (parseFloat(serviceRate) - parseFloat(arrivalRate))
    //     : 0
    // )

    setavgTimeInSystem(1 / (parseFloat(serviceRate) - parseFloat(arrivalRate)))

    // Calculate Average Time a Customer Spends Waiting in the Queue (Wq)
    // setavgTimeInQueue(
    //   utilizationFactor > 0 ? avgTimeInSystem - 1 / parseFloat(serviceRate) : 0
    // )

    setavgTimeInQueue(avgTimeInSystem - 1 / parseFloat(serviceRate))
    // Calculate Average Number of Customers in the Queue (Lq)
    setavgCustomersInQueue(parseFloat(arrivalRate) * avgTimeInQueue)
    // Calculate Average Number of Customers in the System (L)
    setavgCustomersInSystem(parseFloat(arrivalRate) * avgTimeInSystem)
  }

  const calculateFactorial = n => {
    if (n === 0) return 1
    let factorial = 1
    for (let i = 1; i <= n; i++) {
      factorial *= i
    }
    return factorial
  }

  return (
    <div className=" flex flex-col  justify-center items-center space-y-8 mt-4">
      <div className=" justify-center">
        <h1 className="text-3xl font-bold text-[]">M/M/2 Priority Simulator</h1>
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
      </div>

      <div className="flex">
        <StyledButton
          onClick={saveValues}
          color="#003F47" // hover
          background="#006775" // after click
        >
          Save
        </StyledButton>

        <StyledButton
          onClick={generatePriorityTable}
          color="#004021"
          background="#076638"
        >
          Submit
        </StyledButton>
      </div>

      {tableGenerated && (
        <div>
          <table className=" w-full mt-4 mb-7">
            <thead>
              <tr>
                <th className=" text-white  px-4 ">S.no#</th>
                <th className=" text-white  px-4">
                  Cumulative Probability (Cp)
                </th>
                <th className=" text-white  px-4">Cp Lookup</th>
                <th className=" text-white  px-4">Avg Time Between Arrivals</th>
                <th className=" text-white  px-4">Inter Arrival Time</th>
                <th className=" text-white  px-4">Arrival Time</th>
                <th className=" text-white  px-4">Service Time</th>
              </tr>
            </thead>
            <tbody>
              {cpValues.map((value, index) => (
                <tr key={index}>
                  <td className="  px-4">{value.x + 1}</td>
                  <td className="  px-4">
                    {value.cumulativeProbability.toFixed(6)}
                  </td>
                  <td className="  px-4">{cpLookupTable[index].toFixed(6)}</td>
                  <td className="  px-4">{value.x}</td>
                  <td className="  px-4">{interArrivalTimes[index] || 0}</td>
                  <td className="  px-4">{arrivalTimes[index] || 0}</td>
                  <td className="  px-4">{serviceTimes[index] || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full mt-4 mb-7 text-left">
            <tr>
              <th className="text-left text-white px-4">Metric</th>
              <th className="text-white px-4">Value</th>
            </tr>
            <tr>
              <td className="text-left px-4"> Utilization Factor (ρ)</td>
              <td className="px-4">{utilizationFactor.toFixed(2)}</td>
            </tr>

            <tr>
              <td className="text-left px-4">
                {" "}
                Average Time a Customer Spends in the System (W){" "}
              </td>
              <td className="px-4">{avgTimeInSystem.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="text-left px-4">
                {" "}
                Average Time a Customer Spends Waiting in the Queue (Wq){" "}
              </td>
              <td className="px-4">{avgTimeInQueue.toFixed(2)}</td>
            </tr>

            <tr>
              <td className="text-left px-4">
                {" "}
                Average Number of Customers in the Queue (Lq){" "}
              </td>
              <td className="px-4">{avgCustomersInQueue.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="text-left px-4">
                {" "}
                Average Number of Customers in the System (L){" "}
              </td>
              <td className="px-4">{avgCustomersInSystem.toFixed(2)}</td>
            </tr>
          </table>
          <div className=" flex flex-col  justify-center items-center space-y-4 mt-4 mb-12">
            <Priority TableLength={cpValues.length} />
          </div>
        </div>
      )}
    </div>
  )
}
