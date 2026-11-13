const loginTab=document.querySelector('#loginTab');
const registerTab=document.querySelector('#registerTab');
const loginPanel=document.querySelector('#loginPanel');
const registerPanel=document.querySelector('#registerPanel');
function showPanel(which,updateHash=true){
  const isRegister=which==='register';
  loginPanel.hidden=isRegister; registerPanel.hidden=!isRegister;
  loginTab.setAttribute('aria-selected',String(!isRegister));
  registerTab.setAttribute('aria-selected',String(isRegister));
  if(updateHash) history.replaceState(null,'',isRegister?'#register':'#login');
  (isRegister?document.querySelector('#firstName'):document.querySelector('#loginIdentifier'))?.focus({preventScroll:true});
}
loginTab.addEventListener('click',()=>showPanel('login'));
registerTab.addEventListener('click',()=>showPanel('register'));
document.querySelectorAll('[data-open-register]').forEach(b=>b.addEventListener('click',()=>showPanel('register')));
document.querySelectorAll('[data-open-login]').forEach(b=>b.addEventListener('click',()=>showPanel('login')));
showPanel(location.hash==='#register'?'register':'login',false);

let loginMethod='email';
const loginIdentifier=document.querySelector('#loginIdentifier');
const loginIdentifierLabel=document.querySelector('#loginIdentifierLabel');
const loginSecretWrap=document.querySelector('#loginSecretWrap');
const loginSecretLabel=document.querySelector('#loginSecretLabel');
const loginSecret=document.querySelector('#loginSecret');
const loginContinue=document.querySelector('#loginContinue');
document.querySelectorAll('[data-login-method]').forEach(button=>button.addEventListener('click',()=>{
  loginMethod=button.dataset.loginMethod;
  document.querySelectorAll('[data-login-method]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  loginIdentifier.type=loginMethod==='email'?'email':'tel';
  loginIdentifier.autocomplete=loginMethod==='email'?'email':'tel';
  loginIdentifier.placeholder=loginMethod==='email'?'Enter your email address':'Enter your phone number';
  loginIdentifierLabel.textContent=loginMethod==='email'?'Email':'Phone number';
  loginStep=1;loginSecretWrap.hidden=true;loginSecret.required=false;loginSecret.value='';
  loginSecret.type='password';loginSecret.inputMode='text';
  loginContinue.textContent='Continue';document.querySelector('#loginFeedback').textContent='';
}));
let loginStep=1;
document.querySelector('#loginForm').addEventListener('submit',event=>{
  event.preventDefault();const feedback=document.querySelector('#loginFeedback');feedback.className='form-feedback';feedback.textContent='';
  const value=loginIdentifier.value.trim();
  const valid=loginMethod==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value):/^\+?[0-9() .-]{7,}$/.test(value);
  if(!valid){feedback.classList.add('error');feedback.textContent=loginMethod==='email'?'Enter a valid email address.':'Enter a valid phone number.';loginIdentifier.focus();return;}
  if(loginStep===1){loginSecretWrap.hidden=false;loginSecret.required=true;loginSecretLabel.textContent=loginMethod==='email'?'Password':'Verification code';loginSecret.type=loginMethod==='email'?'password':'text';loginSecret.inputMode=loginMethod==='email'?'text':'numeric';loginSecret.placeholder=loginMethod==='email'?'Enter your password':'Enter your verification code';loginSecret.autocomplete=loginMethod==='email'?'current-password':'one-time-code';loginContinue.textContent='Log in';loginStep=2;loginSecret.focus();return;}
  if(!loginSecret.value.trim()){feedback.classList.add('error');feedback.textContent=loginMethod==='email'?'Enter your password.':'Enter your verification code.';loginSecret.focus();return;}
  feedback.classList.add('success');feedback.textContent='Welcome back. Your schedule is ready.';
  const loginEmail=value.toLowerCase();
  let savedProfile=null;
  try { savedProfile=JSON.parse(localStorage.getItem(`dn-account:${loginEmail}`)||"null"); } catch {}
  const displayName=savedProfile?.name || savedProfile?.fullName || value.split('@')[0];
  localStorage.setItem('dn-current-user',JSON.stringify({email:loginEmail,name:displayName,firstName:savedProfile?.firstName || displayName.split(/\\s+/)[0]}));
  const pending=sessionStorage.getItem('dn-pending-booking');
  if(pending){sessionStorage.removeItem('dn-pending-booking');window.location.href=`calendar.html#book=${encodeURIComponent(pending)}`;}
  else{window.location.href='my-schedule.html';}
});

let registerMethod='password';
const registerPassword=document.querySelector('#registerPassword');
const registerPhone=document.querySelector('#registerPhone');
function setRegisterMethod(method){registerMethod=method;document.querySelectorAll('[data-register-method]').forEach(b=>{const active=b.dataset.registerMethod===method;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.querySelector('#registerPasswordFields').hidden=method!=='password';document.querySelector('#registerPhoneFields').hidden=method!=='phone';registerPassword.required=method==='password';registerPhone.required=method==='phone';}
document.querySelectorAll('[data-register-method]').forEach(b=>b.addEventListener('click',()=>setRegisterMethod(b.dataset.registerMethod)));
document.querySelector('#showRegisterPassword').addEventListener('change',e=>{registerPassword.type=e.target.checked?'text':'password';});
document.querySelectorAll('[data-toggle-password]').forEach(button=>button.addEventListener('click',()=>{const field=document.getElementById(button.dataset.togglePassword);const reveal=field.type==='password';field.type=reveal?'text':'password';button.setAttribute('aria-label',reveal?'Hide password':'Show password');button.innerHTML=`<i class="fa-regular ${reveal?'fa-eye-slash':'fa-eye'}"></i>`;}));
document.querySelector('#registerForm').addEventListener('submit',event=>{
  event.preventDefault();const feedback=document.querySelector('#registerFeedback');feedback.className='form-feedback';feedback.textContent='';
  const first=document.querySelector('#firstName'),last=document.querySelector('#lastName'),email=document.querySelector('#registerEmail'),zip=document.querySelector('#zipCode'),year=document.querySelector('#birthYear');
  if(!first.value.trim()||!last.value.trim()){feedback.classList.add('error');feedback.textContent='Please enter your first and last name.';(!first.value.trim()?first:last).focus();return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){feedback.classList.add('error');feedback.textContent='Please enter a valid email address.';email.focus();return;}
  if(registerMethod==='password'&&registerPassword.value.length<8){feedback.classList.add('error');feedback.textContent='Your password must contain at least 8 characters.';registerPassword.focus();return;}
  if(registerMethod==='phone'&&!/^\+?[0-9() .-]{7,}$/.test(registerPhone.value.trim())){feedback.classList.add('error');feedback.textContent='Please enter a valid phone number.';registerPhone.focus();return;}
  if(!zip.value.trim()){feedback.classList.add('error');feedback.textContent='Please enter your ZIP code.';zip.focus();return;}
  if(year.value&&(Number(year.value)<1900||Number(year.value)>new Date().getFullYear())){feedback.classList.add('error');feedback.textContent='Please enter a valid birth year.';year.focus();return;}
  feedback.classList.add('success');feedback.textContent='Your account is ready. Opening your schedule...';
  const accountEmail=email.value.trim().toLowerCase();
  const profile={email:accountEmail,firstName:first.value.trim(),lastName:last.value.trim(),name:`${first.value.trim()} ${last.value.trim()}`};
  localStorage.setItem(`dn-account:${accountEmail}`,JSON.stringify(profile));
  localStorage.setItem('dn-current-user',JSON.stringify(profile));
  window.location.href='my-schedule.html';
});
