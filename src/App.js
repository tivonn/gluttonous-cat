import React, {useState, useEffect} from 'react'
import Mousetrap from 'mousetrap'
import './App.scss'
import Icon from './components/Icon.js'
import catMusic from './assets/music/cat.mp3'
import eatMusic from './assets/music/eat.mp3'
import dieMusic from './assets/music/die.mp3'

//#region preload
const WIDTH = 10
const HEIGHT = 10
const STATUS = {
  'ready': 1,
  'playing': 2,
  'stop': 3,
  'end': 4
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
const MUSIC = {
  'cat': new Audio(catMusic),
  'eat': new Audio(eatMusic),
  'die': new Audio(dieMusic)
}

let catList
let direction
let moveTimer
//#endregion preload

function App() {
  //#region init
  let [status, setStatus] = useState(null)
  let [matrix, setMatrix] = useState(null)
  let [score, setScore] = useState(0)
  //#endregion init

  //#region lifecycle
  useEffect(() => {
    ready()
    return () => reset()
  }, [])

  function ready () {
    setStatus(STATUS['ready'])
    score = 0
    setScore(score)
    direction = DIRECTION['right']
    createMatrix()
    createCat()
    createFood()
  }

  function start () {
    setStatus(STATUS['playing'])
    makeSound('cat')
    createTimer()
    createKeyEvent()
  }

  function stop () {
    setStatus(STATUS['stop'])
    reset()
  }

  function die () {
    setStatus(STATUS['end'])
    makeSound('die')
    reset()
  }

  function reset () {
    clearTimer()
    clearKeyEvent()
  }

  function restart () {
    ready()
    start()
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
      if (direction !== newDirection) {
        makeSound('cat')
        direction = newDirection
      }
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
      default:
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
        makeSound('eat')
        score++
        setScore(score)
        createFood()
        break
      default:
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

  //#region music
  function makeSound (type) {
    MUSIC[type].play()
  }
  //#endregion food

  return (
    <div className="app">
      <div className="container">
        {/*元素顺序不会发生变化，且无唯一id，所以使用index作为key*/}
        {
          matrix &&
          <table className="matrix">
            <tbody>
            { matrix.map((row, rowIndex) => {
              return (
                <tr key={rowIndex} className="row">
                  { row.map((col, colIndex) => {
                    return (
                      <td key={colIndex} className="diamond">
                        {(() => {
                          switch (col) {
                            case TYPE['empty']:
                              return ''
                            case TYPE['cat']:
                              return <Icon svgId='iconArtboard' size='25px' title='cat'></Icon>
                            case TYPE['food']:
                              return <Icon svgId='iconaguoguaguatubiao-yulei-' size='26px' title='food'></Icon>
                            default:
                              return ''
                          }
                        })()}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            </tbody>
          </table>
        }
        <div className="bottom">
          <span className="score">{score}</span>
          <span className="division">|</span>
          <span className="status">
            {(() => {
              switch (status) {
                case STATUS['ready']:
                case STATUS['stop']:
                  return (
                    <span onClick={start}>
                      <Icon svgId='iconkaishi' size='23px' color='#fff' title='开始游戏' className="start"></Icon>
                    </span>
                  )
                case STATUS['playing']:
                  return (
                    <span onClick={stop}>
                      <Icon svgId='iconzanting_huaban' size='23px' color='#fff' title='暂停游戏' className="stop"></Icon>
                    </span>
                  )
                case STATUS['end']:
                  return (
                    <span onClick={restart}>
                      <Icon svgId='iconshuaxin1' size='22px' color='#fff' title='重新开始' className="restart"></Icon>
                    </span>
                  )
                default:
                  return ''
              }
            })()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
