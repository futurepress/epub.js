require('babel-polyfill')
import './style'
import ePub from '../..'
global.ePub = ePub // Bug in v3 need ePub to be a global

const book = ePub('https://s3.amazonaws.com/epubjs/books/alice/OPS/package.opf')
const rendition = book.renderTo('viewer', {
  width: '100%',
  height: 600
})
rendition.display('chapter_007.xhtml')

const title = document.getElementById('title')
const next = document.getElementById('next')
const prev = document.getElementById('prev')
const keyListener = (e) => {
  if ((e.keyCode || e.which) === 37) {
    rendition.prev()
  }
  if ((e.keyCode || e.which) === 39) {
    rendition.next()
  }
}
next.addEventListener('click', () => rendition.next())
prev.addEventListener('click', (e) => rendition.prev())
rendition.on('keyup', keyListener)
document.addEventListener('keyup', keyListener, false)

rendition.on('rendered', (section) => {
  const nextSection = section.next()
  const prevSection = section.prev()
  const current = book.navigation.get(section.href)
  if (current) {
    title.textContent = current.label
  }
  next.textContent = nextSection ? '›' : ''
  prev.textContent = prevSection ? '‹' : ''
})

rendition.on('locationChanged', (location) => console.log(location))
