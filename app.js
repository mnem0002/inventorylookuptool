/*
Author: Abhi Balreddygari

Modified  On: 11/03/2021 by Milad Nemati
*/

const API_KEY = "AIzaSyCKCnbqUaKGtF14Hygd5Hfczk5etGUHnWE"
const SPREADSHEET_ID = "1KhwWIFnN_4lEx1pVepKk6yMjLnf3vXHPsaShN2EsJoU"
const INVENTORY_SEARCH_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/LookUpData/?key=${API_KEY}`
const CLAYTON_SITE_ID = "00"

const BUILDINGS = {
  "BLD73": {
    name : "Building 73",
    address : "49 Rainforest Walk",
    code : "0730",
    getFloor: function(roomID) { return `0${roomID[0]}` }
  },
  "MCLV": {
    name : "Monash College Learning Village",
    address  : "33 Innovation Walk",
    code : "073P",
    getFloor: function(roomID) { return `0${roomID[1]}` }
  },
  "WS": {
    name : "Woodside Building",
    address : "20 Exhibition Walk",
    code : "0940",
    getFloor: function(roomID) { return roomID[0] == "L" ? `LG`:`0${roomID[1]}` }
  },
  "LTB": {
    name : "Learning & Teaching Building",
    address : "19 Ancora Imparo Way",
    code : "0920",
    getFloor: function(roomID) { return `0${roomID[0]}` }
  },
  "MUBP": {
    name : "Monash University Business Park",
    address : "710 Blackburn Road",
    code : "2020",
    getFloor: function(roomID) { return `0G`}
  },

}


function formatDate(dateString) {
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  var inputDate  = new Date(dateString)
  return inputDate.toLocaleDateString("en-AU", options)
}

function displayDate() {
  document.getElementById("date").innerHTML = formatDate((new Date()).toString())
}

async function inventoryData() {
  return await fetch(INVENTORY_SEARCH_URL)
    .then(response => response.json())
    .then(data => data.values.filter(row => new Date(row[0])))
    
}

function searchItems(data, query) {
  return data.filter(row => { return (row[1].toLowerCase()).search(query) != -1 })
}

function getLocCode(siteID,building,roomID) {
  let buildingID = building.code
  let floorID = building.getFloor(roomID)
  return `${siteID}${buildingID}${floorID}${roomID}`
}

function formatItemData(data) {
  return data.map( row => {
    let roomID = row[3]
    let name = row[1]
    let building = BUILDINGS[row[2]]
    building.mazeMapURL = `http://use.mazemap.com/?campusid=159&sharepoitype=identifier&sharepoi=${getLocCode(CLAYTON_SITE_ID,building,roomID)}&zoom=21`
    console.log(building.mazeMapURL)
    return { 
      itemName: `Item: ${name}`,
      stockroom: row[0],
      name: building.name, 
      room: `Room ${roomID}`,
      address: building.address, 
      
      mazeMapURL: building.mazeMapURL
      } 
      
  })
}

function createItemElement(id, item) {
  let itemElement = document.createElement("div")
  itemElement.id = id
  itemElement.className = "item"
  for (const [key, value] of Object.entries(item)) {
    let element = document.createElement("div")
    let text = document.createTextNode(value)
    if (key == "mazeMapURL") {
      let aElement = document.createElement("a")
      aElement.href = value
      text = document.createTextNode("🡢 Directions")
      aElement.appendChild(text)
      text = aElement
    } 
    element.className = `${key}`
    element.appendChild(text)
    itemElement.appendChild(element)
  }
  return itemElement
}

function renderItemData(data) {
  let list = document.getElementById("list")
  list.replaceChildren()
  for (const [index, item] of data.entries()) {
    list.appendChild(createItemElement(`a${index}`,item))
  }
  if (list.children.length == 0) {
    list.appendChild(createItemElement("a0",{error: "Sorry, no matches found"}))
  }
}

function search() {
  let query = document.forms["search_form"]["search_query"].value.toLowerCase()
  items
    .then(data => searchItems(data,query))
    .then(data => formatItemData(data))
    .then(data => renderItemData(data))
}


displayDate();
let items = inventoryData()