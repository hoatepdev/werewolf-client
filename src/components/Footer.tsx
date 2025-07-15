import React from 'react'

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3">
      <div className="mb-2 flex items-center gap-8">
        <a
          href="#"
          className="flex flex-col items-center text-xs text-zinc-200 transition-colors hover:text-yellow-400"
        >
          <span className="text-xl">📖</span>
          Hướng dẫn
        </a>
        <a
          href="#"
          className="flex flex-col items-center text-xs text-zinc-200 transition-colors hover:text-yellow-400"
        >
          <span className="text-xl">👥</span>
          Điều khoản sử dụng
        </a>
        <a
          href="#"
          className="flex flex-col items-center text-xs text-zinc-200 transition-colors hover:text-yellow-400"
        >
          <span className="text-xl">🛡️</span>
          Chính sách bảo mật
        </a>
      </div>
      <div className="text-center text-xs text-zinc-400">
        VERSION 1.0.0
        <br />
        Powered by:{' '}
        <a
          href="https://www.p.hoatepdev.site"
          target="_blank"
          className="text-yellow-400"
        >
          hoatep
        </a>
      </div>
    </footer>
  )
}
