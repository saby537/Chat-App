const socket=io()

// Elements
const $messageForm=document.querySelector("#message-form")
const $messageFormInput=$messageForm.querySelector("input")
const $messageFormButton=$messageForm.querySelector("button")
const $sendLocationButton=document.querySelector("#send-location")
const $messages=document.querySelector("#messages")

//Templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationMessageTemplate=document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true })

const autoscroll=()=>{
    // Getting new message and its height
    const $newMessages=$messages.lastElementChild
    const newMessagesStyles=getComputedStyle($newMessages)
    const newMessagesMargin=parseInt(newMessagesStyles.marginBottom)
    const newMessagesHeight=$newMessages.offsetHeight+newMessagesMargin
    // Getting the view area height
    const visibleHeight=$messages.offsetHeight
    // Getting the entire message area height
    const containerHeight=$messages.scrollHeight
    // Getting how much scrolled height
    const scrollOffsetHeight=$messages.scrollTop+visibleHeight 
    // Total height - height of new message should be equal to the scrolled area heights
    if(containerHeight-newMessagesHeight<=scrollOffsetHeight){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on("message",(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})
socket.on("locationMessage",(url)=>{
    console.log(url)
    const html=Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})
$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    socket.emit("sendMessage",message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log("Status: Delivered")
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",{
            Latitude:position.coords.latitude,
            Longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!!!")
        })
    })

})
socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
socket.on("roomData",({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})