declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

export default defineNuxtPlugin(() => {
  // Add FB root div
  if (!document.getElementById('fb-root')) {
    const fbRoot = document.createElement('div')
    fbRoot.id = 'fb-root'
    document.body.appendChild(fbRoot)
  }

  // Add Messenger chat div
  if (!document.querySelector('.fb-customerchat')) {
    const chatDiv = document.createElement('div')
    chatDiv.className = 'fb-customerchat'
    chatDiv.setAttribute('attribution', 'biz_inbox')
    chatDiv.setAttribute('page_id', '100855749241228') // 👈 Your Page ID
    document.body.appendChild(chatDiv)
  }

  // Load SDK
  if (!document.getElementById('facebook-jssdk')) {
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js'
    document.body.appendChild(script)
  }

  // Init FB SDK
  window.fbAsyncInit = function () {
    if (window.FB) {
      window.FB.init({
        xfbml: true,
        version: 'v18.0',
      })
    }
  }
})
