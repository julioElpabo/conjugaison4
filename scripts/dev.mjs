import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

function canListen(port, host) {
  return new Promise((resolveResult, reject) => {
    const server = createServer()
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') resolveResult(false)
      else if (host.includes(':') && ['EAFNOSUPPORT', 'EADDRNOTAVAIL'].includes(error.code)) resolveResult(true)
      else reject(error)
    })
    server.listen({ port, host, exclusive: true }, () => {
      server.close((error) => error ? reject(error) : resolveResult(true))
    })
  })
}

export async function findAvailablePort(start = 3000) {
  if (!Number.isInteger(start) || start < 1 || start > 65535) {
    throw new Error('Le port doit être un entier entre 1 et 65535.')
  }
  for (let port = start; port <= 65535; port++) {
    // Tester les deux familles évite de choisir un port déjà occupé sur localhost.
    let available = true
    for (const host of ['127.0.0.1', '::1', '0.0.0.0', '::']) {
      if (!await canListen(port, host)) {
        available = false
        break
      }
    }
    if (available) return port
  }
  throw new Error(`Aucun port disponible à partir de ${start}.`)
}

async function main() {
  const [command, ...inputArgs] = process.argv.slice(2)
  if (!command) throw new Error('Commande de développement manquante.')
  let start = 3000
  const args = []
  for (let i = 0; i < inputArgs.length; i++) {
    const arg = inputArgs[i]
    if (arg === '--port' || arg === '-p') start = Number(inputArgs[++i])
    else if (arg.startsWith('--port=')) start = Number(arg.slice(7))
    else args.push(arg)
  }
  const port = await findAvailablePort(start)
  console.log(`[dev] Premier port libre : ${port} — http://localhost:${port}`)
  const child = spawn(command, [...args, '--port', String(port)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(port) },
  })
  const interrupt = () => child.kill('SIGINT')
  const terminate = () => child.kill('SIGTERM')
  process.on('SIGINT', interrupt)
  process.on('SIGTERM', terminate)
  child.once('error', (error) => {
    console.error(`[dev] ${error.message}`)
    process.exitCode = 1
  })
  child.once('exit', (code, signal) => {
    process.off('SIGINT', interrupt)
    process.off('SIGTERM', terminate)
    process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 143)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[dev] ${error.message}`)
    process.exitCode = 1
  })
}
