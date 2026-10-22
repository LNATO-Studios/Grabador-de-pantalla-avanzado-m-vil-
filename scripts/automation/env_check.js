import os from "node:os"

console.log(`node=${process.version}`)
console.log(`platform=${os.platform()} ${os.release()}`)
console.log(`executable=${process.execPath}`)
console.log(`cwd=${process.cwd()}`)
try {
  require("fast-check")
  console.log("fast-check=available")
} catch {
  console.log("fast-check=missing")
}
