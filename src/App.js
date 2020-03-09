import React, {useState, useEffect} from 'react'
import Mousetrap from 'mousetrap'
import './App.css'

//#region preload
const WIDTH = 10
const HEIGHT = 10
const STATUS = {
  'ready': 1,
  'playing': 2,
  'end': 3
}
const TYPE = {
  'empty': 1,
  'cat': 2,
  'food': 3
}
const DIRECTION = {
  'upward': 1,
  'right': 2,
  'downward': 3,
  'left': 4
}
const INTERVAL = 1000
const MAX_LENGTH = 30

let catList
let direction
let moveTimer
//#endregion preload

function App() {
  //#region init
  let [status, setStatus] = useState(null)
  let [matrix, setMatrix] = useState(null) // 创建二维矩阵
  //#endregion init

  //#region lifecycle
  useEffect(() => {
    ready()
    return () => reset()
  }, [])

  function ready () {
    setStatus(STATUS['ready'])
    direction = DIRECTION['right']
    createMatrix()
    createCat()
    createFood()
  }

  function start () {
    setStatus(STATUS['playing'])
    createTimer()
    createKeyEvent()
  }

  function restart () {
    ready()
    start()
  }

  function die () {
    setStatus(STATUS['end'])
    reset()
  }

  function reset () {
    clearTimer()
    clearKeyEvent()
  }

  function createTimer () {
    moveTimer = setInterval(() => {
      moveCat()
        .catch(() => {})
    }, INTERVAL)
  }

  function clearTimer () {
    moveTimer && clearInterval(moveTimer)
  }

  function refreshTimer () {
    clearTimer()
    createTimer()
  }

  function createKeyEvent () {
    const keys = [{
      value: ['up', 'w'],
      direction: 'upward'
    }, {
      value: ['right', 'd'],
      direction: 'right'
    }, {
      value: ['down', 's'],
      direction: 'downward'
    }, {
      value: ['left', 'a'],
      direction: 'left'
    }]
    keys.forEach(key => {
      Mousetrap.bind(key.value, () => {
        moveCat(DIRECTION[key.direction])
          .then(() => {
            refreshTimer()
          })
          .catch(() => {})
      })
    })
  }

  function clearKeyEvent () {
    Mousetrap.reset()
  }
  //#endregion lifecycle

  //#region matrix
  function createMatrix () {
    matrix = Array.apply(null, Array(WIDTH)).map(() => Array.apply(null, Array(HEIGHT)).map(() => TYPE['empty']))
    setMatrix(matrix)
  }

  function updateCoordinate (x, y, value) {
    matrix[y][x] = value
    setMatrix([...matrix])
  }
  //#endregion matrix

  //#region cat
  function CatNode (props) {
    this.x = props.x
    this.y = props.y
    this.prev = null
    this.next = null
  }

  function CatList (props) {
    this.head = null
    this.tail = null
    this.length = 0
    props && this.unshift(props)
  }

  CatList.prototype.unshift = function (props) {
    let node = new CatNode(props)
    this.head && (this.head.prev = node)
    node.next = this.head
    this.head = node
    updateCoordinate(this.head['x'], this.head['y'], TYPE['cat'])
    !this.tail && (this.tail = node)
    this.length++
  }

  CatList.prototype.pop = function () {
    if (!this.tail) return
    updateCoordinate(this.tail['x'], this.tail['y'], TYPE['empty'])
    this.tail = this.tail.prev
    if (this.tail) {
      this.tail.next = null
    } else {
      this.head = null
    }
    this.length--
  }

  CatList.prototype.size = function () {
    return this.length
  }

  function createCat () {
    catList = new CatList({x: 4, y: 3})
  }

  function moveCat (newDirection) {
    if (newDirection) {
      if (Math.abs(newDirection - direction) === 2) return Promise.reject('opposite') // opposite direction
      direction = newDirection
    }
    let x, y
    switch (direction) {
      case DIRECTION['upward']:
        x = catList.head['x']
        y = catList.head['y'] - 1
        break
      case DIRECTION['right']:
        x = catList.head['x'] + 1
        y = catList.head['y']
        break
      case DIRECTION['downward']:
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
      return Promise.reject('over')
    }
    switch (matrix[y][x]) {
      case TYPE['empty']:
        catList.unshift({x, y})
        catList.pop()
        break
      case TYPE['cat']:
        die()
        return Promise.reject('eatItself')
      case TYPE['food']:
        catList.unshift({x, y})
        ;(catList.length > MAX_LENGTH) && catList.pop()
        createFood()
        break
    }
    return Promise.resolve()
  }
  //#endregion cat

  //#region food
  function createFood () {
    const x = Math.floor(Math.random() * WIDTH)
    const y = Math.floor(Math.random() * HEIGHT)
    if (matrix[y][x] === TYPE['empty']) {
      updateCoordinate(x, y, TYPE['food'])
    } else {
      createFood()
    }
  }
  //#endregion cat

  return (
    <div className="App">
      <button onClick={start}>start</button>
      <button onClick={restart}>restart</button>
      {/*元素顺序不会发生变化，且无唯一id，所以使用index作为key*/}
      {
        matrix &&
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
      }
      <p>{status === 1 ? '未开始' : status === 2 ? '游戏中' : '游戏结束'}</p>
    </div>
  )
}

export default App
