import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Band-Stage
            </Link>
            <p className="text-sm text-gray-600">
              밴드와 팬을 연결하는 공연 플랫폼
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">빠른 링크</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
                  공연 둘러보기
                </Link>
              </li>
              <li>
                <Link href="/venues" className="text-sm text-gray-600 hover:text-gray-900">
                  공연장 가이드
                </Link>
              </li>
              <li>
                <Link href="/tickets/design" className="text-sm text-gray-600 hover:text-gray-900">
                  티켓 디자인
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">고객지원</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">법적 고지</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Band-Stage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

