import React from 'react'
import '../assets/iconfont/iconfont.js'
import './Icon.scss'

function Icon (props) {
  const {
    svgId,
    size = '16px',
    color = '#999',
    title
  } = props
  return (
    <svg className="icon" style={{width: size, height: size, fill: color}} aria-hidden="true">
      {title && <title>{ title }</title>}
      <use xlinkHref={`#${svgId}`}></use>
    </svg>
  )
}

export default Icon
