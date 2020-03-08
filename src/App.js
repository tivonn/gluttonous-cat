import React, {useEffect, useState} from 'react'
import './App.css'

function App() {
  //#region ready
  const WIDTH = 10
  const HEIGHT = 10
  const STATUS = {
    'ready': 1,
    'playing': 2,
    'end': 3
  }
  const TYPE = {
    'empty': 0,
    'cat': 1,
    'food': 2
  }
  const DIRECTION = {
    'top': 0,
    'right': 1,
    'bottom': 2,
    'left': 3
  }
  let status = STATUS['playing']
  let [matrix, setMatrix] = useState(Array.apply(null, Array(WIDTH)).map(() => Array.apply(null, Array(HEIGHT)).map(() => TYPE['empty']))) // 创建二维矩阵
  let direction = DIRECTION['right']
  let catList = null
  let moveTimer
  //#endregion ready

  //#region lifecycle
  useEffect(() => {
    createCat()
    createFood()
    moveTimer = setInterval(() => {
      moveCat()
    }, 1000)
    return () => {
      clearInterval(moveTimer)
    }
  }, [])
  //#endregion lifecycle

  //#region matrix
  function updateCoordinate (x, y, value) {
    matrix[y][x] = value
    setMatrix([...matrix])
  }
  //#endregion matrix

  //#region cat
  function CatNode (props) {
    this.x = props.x
    this.y = props.y
    this.next = null
  }

  function CatList (props) {
    this.head = null
    this.length = 0
    if (props) {
      this.unshift(props)
    }
  }

  CatList.prototype.unshift = function (props) {
    let node = new CatNode(props)
    node.next = this.head
    this.head = node
    this.length++
    updateCoordinate(this.head['x'], this.head['y'], TYPE['cat'])
  }

  CatList.prototype.shift = function () {
    let current = this.head
    if (!current) return
    if (this.size() > 1) {
      while (current.next && current.next.next) {
        current = current.next
      }
    }
    let tail = current.next
    updateCoordinate(tail['x'], tail['y'], TYPE['empty'])
    current.next = null
    this.length--
  }

  CatList.prototype.size = function () {
    return this.length
  }

  function createCat () {
    catList = new CatList({x: 4, y: 3})
  }

  function moveCat () {
    let x, y
    switch (direction) {
      case DIRECTION['top']:
        x = catList.head['x']
        y = catList.head['y'] - 1
        break
      case DIRECTION['right']:
        x = catList.head['x'] + 1
        y = catList.head['y']
        break
      case DIRECTION['bottom']:
        x = catList.head['x']
        y = catList.head['y'] + 1
        break
      case DIRECTION['left']:
        x = catList.head['x'] - 1
        y = catList.head['y']
        break
    }
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
      die()
      return
    }
    catList.unshift({x, y})
    catList.shift()
  }
  //#endregion cat

  //#region food
  function createFood () {
    const x = Math.floor(Math.random() * WIDTH)
    const y = Math.floor(Math.random() * HEIGHT)
    if (matrix[x][y] === TYPE['empty']) {
      updateCoordinate(x, y, TYPE['food'])
    } else {
      createFood()
    }
  }
  //#endregion cat

  //#region status
  function die () {
    status = STATUS['end']
    clearInterval(moveTimer)
  }
  //#endregion status

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
