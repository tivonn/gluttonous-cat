import React, {useEffect, useState} from 'react'
import './App.css'

function App() {
  const WIDTH = 10
  const HEIGHT = 10
  const TYPE = {
    'empty': 0,
    'cat': 1,
    'food': 2
  }
  let [matrix, setMatrix] = useState(Array.apply(null, Array(WIDTH)).map(() => Array.apply(null, Array(HEIGHT)).map(() => TYPE['empty']))) // 创建二维矩阵
  let direction = 'right'
  let head = {
    x: 3,
    y: 3
  }

  useEffect(() => {
    createCat()
    createFood()
  }, [])

  function createCat () {
    updateCoordinate(head['x'], head['y'], TYPE['cat'])
  }

  function moveCat () {
    switch (direction) {
      case 'top':
        break
      case 'right':
        break
      case 'bottom':
        break
      case 'left':
        break
    }
  }

  function createFood () {
    const x = Math.floor(Math.random() * WIDTH)
    const y = Math.floor(Math.random() * HEIGHT)
    if (matrix[x][y] === TYPE['empty']) {
      updateCoordinate(x, y, TYPE['food'])
    } else {
      createFood()
    }
  }

  function updateCoordinate (x, y, value) {
    matrix[x][y] = value
    setMatrix([...matrix])
  }

  return (
    <div className="App">
      {/*元素顺序不会发生变化，且无唯一id，所以使用index作为key*/}
      <table>
        <tbody>
        { matrix.map((row, rowIndex) => {
          return (
            <tr key={rowIndex}>
              { row.map((col, colIndex) => {
                return (
                  <td key={colIndex}>{col}</td>
                )
              })}
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  )
}

export default App
