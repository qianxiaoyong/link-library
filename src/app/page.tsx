import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-zinc-900">网盘链接库</h1>
        <p className="mt-4 text-zinc-600">
          个人本地登记与管理百度网盘、夸克网盘学习资料链接。
        </p>
        <Link
          href="/links"
          className="mt-8 inline-flex rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          进入资料库
        </Link>
      </div>
    </main>
  );
}
