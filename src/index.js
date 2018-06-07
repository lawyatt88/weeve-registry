import _ from 'lodash'

window.onscroll = () => {
  let scroll = window.scrollY;

  //create horizontal scroll based on vertical scroll
  let second = document.getElementById('apply-wrapper-inner')
  second.setAttribute("style", `left: -${scroll}px`)
}

function mouseLocation(onMove, listeningElementId) {
  if (listeningElementId) document.getElementById(listeningElementId).onmousemove = handleMouseMove;
  else document.onmousemove = handleMouseMove

  function handleMouseMove(event) {
    let dot, eventDoc, doc, body, pageX, pageY;

    event = event || window.event;

    if (event.pageX == null && event.clientX != null) {
      eventDoc = (event.target && event.target.ownerDocument) || document;
      doc = eventDoc.documentElement;
      body = eventDoc.body;

      event.pageX = event.clientX +
        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
        (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY +
        (doc && doc.scrollTop || body && body.scrollTop || 0) -
        (doc && doc.clientTop || body && body.clientTop || 0);
    }

    onMove(event.pageX, event.pageY)
  }
}

//invoke the function inside of an event listener for a hover or click event on the status bar
let statusBlocks = document.getElementsByClassName('card-body-hover')
Array.prototype.forEach.call(statusBlocks, (status) => {
  status.onmouseover = (event) => {
    mouseLocation((x, y) => {
      let statusX = $('#apply-status-info').position().left
      let statusY = ($('#apply-status-info').position().top + $('#apply-status-info').outerHeight(true)) / 10
      let statusPath = $('#status-path')
      let curveWidth = status.offsetWidth * 2
      let endX = $('#apply-status-info').width()

      createPath(statusX, statusY, x, endX, statusY, curveWidth, statusPath)
    }, 'apply-status-info')
  }
})

// add event listener to reset curve center to current status
document.getElementById('apply-status-info').onmouseout = (event) => {
  updateStatusPath()
}

const updateStatusPath = () => {
  let statusX = $('#apply-status-info').position().left
  let statusY = ($('#apply-status-info').position().top + $('#apply-status-info').outerHeight(true)) / 10
  let statusPath = $('#status-path')
  let endX = $('#apply-status-info').width()
  let centerX = $('.current-status').position().left + ($('.current-status').outerWidth(true) / 2)
  let curveWidth = ($('.status-block').outerWidth(true)) * 2

  createPath(statusX, statusY, centerX, endX, statusY, curveWidth, statusPath)
}

//for selected panel or hovered panel, find the coordinates and add to SVG
const createPath = (startX, startY, centerX, endX, endY, curveWidth, ...pathEls) => {
  startY = Math.round(startY)
  let pathStart = `M${startX},${startY}`
  let pathEnd = `L${endX},${endY}`

  curveWidth = 6 * Math.round(curveWidth / 6)
  centerX = 6 * Math.round(centerX / 6)
  let curveStartX = Math.round(centerX - (curveWidth / 2))
  let pathCoordinates = {
    0: `L${curveStartX},${startY}`
  }

  let incrementX = 3 * Math.round((curveWidth / 2) / 3 / 3)
  let unit = incrementX / 3
  let correctPath = ''

  let currentX = curveStartX
  let currentY = startY
  let pointCount = 1

  while (pointCount <= 6) {
    //find X coordinates
    currentX += incrementX
    if (pointCount % 2 === 0) {
      //even, not a 'Q' point
      pathCoordinates[pointCount] = `${currentX}`
    } else {
      //odd, 'Q' point
      pathCoordinates[pointCount] = `Q${currentX}`
    }

    //find Y coordinates
    if (pointCount === 1 || pointCount === 5 || pointCount === 6) {
      pathCoordinates[pointCount] += `,${startY}`
    } else {
      currentY = pointCount % 2 ? startY + (unit * 4) : startY + (unit * 2)
      pathCoordinates[pointCount] += `,${currentY}`
    }

    pointCount++
  }

  //create curved path
  for (let point in pathCoordinates) {
    if (!point) correctPath = pathCoordinates[point]
    else correctPath += ` ${pathCoordinates[point]}`
  }

  correctPath = pathStart.concat(correctPath, pathEnd)

  //correctPath += ` L${$('.apply-process-wrapper').width()},${startY}`
  pathEls.forEach((pathEl) => pathEl.attr('d', correctPath))
}

let width = document.body.offsetWidth

//get screen width and set it as width of panels
let panelWrapper = document.getElementById('panel-wrapper')
panelWrapper.setAttribute("style", `width: ${width}px;`)

let panels = document.getElementsByClassName('panel')
Array.prototype.forEach.call(panels, (panel) => panel.setAttribute("style", `width: ${width}px;`))

let curve = document.getElementById('curve')
curve.setAttribute('style', `top: ${panelWrapper.offsetHeight / 2}`)


//onclick: scroll to first panel
let applyButton = document.getElementById('apply-btn')
applyButton.onclick = () => {
  document.getElementById('apply-btn-wrapper').setAttribute('style', 'height: 0')
  let processWrapperHeight = $('#curve').position().top + $('#curve').outerHeight(true)
  let processWrapper = document.getElementById('apply-process-wrapper')
  processWrapper.setAttribute("style", `height: ${processWrapperHeight}px;`)
  applyButton.setAttribute("style", 'display: none')
  processWrapper.setAttribute("style", `height: ${processWrapperHeight}px;background-color: #200047;`)

  // create background curve
  let startX = $('#apply-wrapper-inner').position().left
  let startY = $('#apply-wrapper-inner').position().top + 10
  let panelWrapperCenterX = $('#panel-wrapper').position().left + ($('#panel-wrapper').width() / 2)
  let endX = $('#panel-wrapper').width()
  let curveWidth = $('#panel-wrapper').width()
  let trail = $('#test')
  createPath(startX, startY, panelWrapperCenterX, endX, startY, curveWidth, trail)

  let innerWrapper = document.getElementById('apply-wrapper-inner')
  innerWrapper.setAttribute("style", `left: -${width}px`)

  let banner = document.getElementById('banner')
  banner.setAttribute("style", `display: none !important;`)

  let welcome = document.getElementById('welcome')
  welcome.setAttribute("style", `top: ${processWrapperHeight}px;`)

  let applyCardWrapper = document.getElementById('apply-card-wrapper')
  applyCardWrapper.setAttribute("style", `-webkit-transform: scale(1);transform: scale(1);`)
  applyCardWrapper.className += ' current-status'
  updateStatusPath()
}

//onSubmit: scroll to next panel
let submitButton = document.getElementById('submit-btn')
submitButton.onclick = (evt) => {
  evt.preventDefault()

  //increase panel width
  panelWrapper.setAttribute("style", `width: ${width * 2}px;`)

  //display verification panel
  let vPanel = document.getElementById('verification')
  vPanel.className = 'panel show'

  let innerWrapper = document.getElementById('apply-wrapper-inner')
  innerWrapper.setAttribute("style", `left: -${width * 2}px`)

  let applyStatus = document.getElementById('apply-status')
  applyStatus.innerHTML = 'Submitted'

  let applyCardWrapper = document.getElementById('apply-card-wrapper')
  applyCardWrapper.removeAttribute('style')
  applyCardWrapper.classList.remove('current-status')

  let verifyCardWrapper = document.getElementById('verify-card-wrapper')
  verifyCardWrapper.setAttribute("style", `-webkit-transform: scale(1);transform: scale(1);`)
  verifyCardWrapper.className += ' current-status'
  updateStatusPath()

  createTimer(10000)
}

const createTimer = (timerLength) => {
  let countdown = document.createElement("P");
  countdown.setAttribute('id', 'verify-timer')
  document.getElementById('verify-card-body').appendChild(countdown);

  let startTime = Date.now()

  const timer = setInterval(function () {
    let totalTime = timerLength
    let elapsedTime = Date.now() - startTime
    let remainingTime = 1000 * Math.round((totalTime - elapsedTime) / 1000)
    remainingTime = remainingTime / 1000
    let secs = remainingTime % 60
    let mins = Math.trunc(remainingTime / 60) % 60
    let hours = Math.trunc(remainingTime / 3600) % 24
    let days = Math.trunc(remainingTime / 3600 / 24)

    let timeStrArr = [hours, mins, secs].map(time => {
      return (time < 10 ? '0' : '') + time
    })

    let remainingTimeStr = `${(days < 10 ? '0' : '') + days}D ` + timeStrArr.join(':')

    if (remainingTime >= 0) {
      let verifyTimer = document.getElementById('verify-timer')
      if (remainingTime === 0) verifyTimer.innerHTML = 'Verification Complete';
      else {
        verifyTimer.innerHTML = `Time Remaining: <br> ${remainingTimeStr}`;
      }
    } else {
      stopTimeCountdown()
      scrollToVerdict()
    }
  }, 1000);

  const stopTimeCountdown = () => {
    clearInterval(timer);
  }
}

//after set timeout scroll to accept/denial (randomize verdict)
const scrollToVerdict = () => {
  //randomize verdict for demo
  let num = Math.round(Math.random())
  let verdict = num ? 'approval' : 'denial'

  //update status bar
  document.getElementById('verdict').innerHTML = num ? 'In Registry' : 'Rejected'

  //increase panel width
  panelWrapper.setAttribute('style', `width: ${width * 3}px;`)

  //display verdict panel
  let vPanel = document.getElementById(verdict)
  vPanel.className = 'panel show'

  let innerWrapper = document.getElementById('apply-wrapper-inner')
  innerWrapper.setAttribute('style', `left: -${width * 3}px`)

  let verifyCardWrapper = document.getElementById('verify-card-wrapper')
  verifyCardWrapper.removeAttribute('style')
  verifyCardWrapper.classList.remove('current-status')

  let verdictCardWrapper = document.getElementById('verdict-card-wrapper')
  verdictCardWrapper.setAttribute('style', `-webkit-transform: scale(1);transform: scale(1);`)
  verdictCardWrapper.className += ' current-status'
  updateStatusPath()
}

//onclick: scroll to registry
let viewRegistryButton = document.getElementById('view-registry-banner')
viewRegistryButton.onclick = () => {
  document.getElementById('apply-btn-wrapper').setAttribute('style', 'height: 0')
  document.getElementById('weeve-registry-inner').removeAttribute('style')
  let statusBlocksCol = document.getElementsByClassName('status-block')
  Array.prototype.forEach.call(statusBlocksCol, (statusBlock) => statusBlock.setAttribute('style', 'z-index: 0'))
  let processWrapperHeight = $('#curve').position().top + $('#curve').outerHeight(true)
  let processWrapper = document.getElementById('apply-process-wrapper')
  processWrapper.setAttribute("style", `height: ${processWrapperHeight}px;`)
  applyButton.setAttribute("style", 'display: none')
  processWrapper.setAttribute("style", `height: ${processWrapperHeight}px;background-color: #200047;`)

  let typeAllWrapper = document.getElementById('type-all-card-wrapper')
  typeAllWrapper.setAttribute('style', `-webkit-transform: scale(1);transform: scale(1);`)
  typeAllWrapper.className += ' current-filter'

  // create curve path
  let centerX = $('.current-filter').position().left + ($('.current-filter').outerWidth(true) / 2)
  let filterX = $('#filter-inner').position().left
  let filterY = ($('#filter-inner').position().top + $('#filter-inner').outerHeight(true)) / 10
  let filterPath = $('#filter-path')
  let curveWidth = ($('#type-all').outerWidth(true)) * 2
  let endX = $('#filter-inner').width()
  createPath(filterX, filterY, centerX, endX, filterY, curveWidth, filterPath)

  let height = window.innerHeight
  let innerWrapper = document.getElementById('weeve-registry-inner')
  innerWrapper.setAttribute("style", `top: -${height}px`)

  let listTop = $('#filter-curve').position().top + $('#filter-curve').outerHeight(true)
  document.getElementById('registry-list-wrapper').setAttribute('style', `top: ${listTop-height}px`)

  let footerHeight = $('#register-device').outerHeight(true)
  let deviceList = document.getElementById('registry-list')
  let deviceListHeight = listTop - height + footerHeight
  deviceList.setAttribute('style', `height: ${deviceListHeight}px`)

  let banner = document.getElementById('banner')
  banner.setAttribute("style", `display: none !important;`)

  document.getElementById('weeve-registry-wrapper').setAttribute("style", `background-color: #8DF0E4;`)

  filterListBy()
}

let filterBlocks = document.getElementsByClassName('filter-card-body-hover')
Array.prototype.forEach.call(filterBlocks, (filter) => {
  filter.onmouseover = (event) => {
    mouseLocation((x, y) => {
      let filterX = $('#filter-inner').position().left
      let filterY = ($('#filter-inner').position().top + $('#filter-inner').outerHeight(true)) / 10
      let filterPath = $('#filter-path')
      let curveWidth = filter.offsetWidth * 2
      let endX = $('#filter-inner').width()

      createPath(filterX, filterY, x, endX, filterY, curveWidth, filterPath)
    }, 'filter-inner')
  }
})

// add event listener to reset curve center to current filter
document.getElementById('filter-inner').onmouseout = (event) => {
  updateFilterPath()
}

const updateFilterPath = () => {
  let statusX = $('#filter-inner').position().left
  let statusY = ($('#filter-inner').position().top + $('#filter-inner').outerHeight(true)) / 10
  let statusPath = $('#filter-path')
  let endX = $('#filter-inner').width()
  let centerX = $('.current-filter').position().left + ($('.current-filter').outerWidth(true) / 2)
  let curveWidth = ($('.filter-type').outerWidth(true)) * 2

  createPath(statusX, statusY, centerX, endX, statusY, curveWidth, statusPath)
}

//add click handlers to filters
let filterEls = document.getElementsByClassName('card-wrapper')
Array.prototype.forEach.call(filterEls, (filter) => {
  let selectedFilterCol = document.getElementsByClassName('current-filter')
  filter.onclick = (event) => {
    Array.prototype.forEach.call(selectedFilterCol, (selectedFilter) => {
      selectedFilter.removeAttribute('style')
      selectedFilter.classList.remove('current-filter')
    })

    filter.setAttribute('style', `-webkit-transform: scale(1);transform: scale(1);`)
    filter.className += ' current-filter'
    updateFilterPath()

    filterListBy(filter.id.slice(0, 6))
  }
})

const dummyDeviceList = {
  'type-1': ['<li>Device 1</li>', '<li>Device 7</li>', '<li>Device 8</li>', '<li>Device 3</li>'],
  'type-2': ['<li>Device 2</li>', '<li>Device 4</li>', '<li>Device 5</li>', '<li>Device 6</li>'],
  'type-3': ['<li>Device 9</li>', '<li>Device 12</li>', '<li>Device 14</li>', '<li>Device 16</li>'],
  'type-4': ['<li>Device 10</li>', '<li>Device 11</li>', '<li>Device 13</li>', '<li>Device 15</li>']
}

const filterListBy = (filterId) => {
  let deviceList = document.getElementById('registry-list')
  let filteredList = []
  if (!filterId || filterId === 'type-a') {
    Object.keys(dummyDeviceList).forEach(key => {
      filteredList = [...filteredList, ...dummyDeviceList[key]]
    })
  } else {
    filteredList = dummyDeviceList[filterId]
  }
  deviceList.innerHTML = filteredList.join('')
}