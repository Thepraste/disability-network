export const normalizeEmail=value=>String(value||"").trim().toLowerCase();
export async function passwordHash(password){
 const bytes=new TextEncoder().encode(password);
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
}
export function readProfile(email){try{return JSON.parse(localStorage.getItem(`dn-account:${normalizeEmail(email)}`)||"null")}catch{return null}}
export function saveProfile(profile){localStorage.setItem(`dn-account:${normalizeEmail(profile.email)}`,JSON.stringify(profile))}
export function readAuth(email){try{return JSON.parse(localStorage.getItem(`dn-staff-auth:${normalizeEmail(email)}`)||"null")}catch{return null}}
export function saveAuth(email,record){localStorage.setItem(`dn-staff-auth:${normalizeEmail(email)}`,JSON.stringify(record))}
export function currentStaff(){try{return JSON.parse(localStorage.getItem("dn-current-user")||"null")}catch{return null}}
export function signOut(){localStorage.removeItem("dn-current-user");location.href="staff-login.html"}
