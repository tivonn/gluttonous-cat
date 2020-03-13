import React from 'react'
import '../assets/iconfont/iconfont.js'
import './Icon.scss'

function Icon (props) {
  const {
    svgId,
    size = '16px',
    color = '#999',
    title,
    className
  } = props
  return (
    <svg className={`iconfont ${className}`} style={{width: size, height: size, fill: color}} aria-hidden="true">
      {title && <title>{ title }</title>}
      <use xlinkHref={`#${svgId}`}></use>
    </svg>
  )
}

export default Icon
