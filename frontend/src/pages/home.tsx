import { Link, Navigate } from "react-router-dom"
import {
  BookOpen,
  Globe,
  Columns2,
  History,
  ExternalLink,
  Github,
  LogIn,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

const features = [
  {
    icon: Globe,
    title: "Работает в браузере",
    description: "Ничего не нужно устанавливать",
  },
  {
    icon: Columns2,
    title: "Текст и скан рядом",
    description:
      "Показывает рядом распознанный текст и скан страницы — удобно сравнивать и исправлять ошибки",
  },
  {
    icon: History,
    title: "История изменений",
    description:
      "Сохраняет историю изменений — можно откатить правку или посмотреть, кто и что менял",
  },
]

const articles = [
  {
    title: "Что такое текстологическая работа и зачем она нужна",
    url: "https://vk.com/@zarya_xyz-chto-takoe-tekstologicheskaya-rabota-i-zachem-ona-nuzhna",
  },
  {
    title: "О воспитательном значении текстологической работы",
    url: "https://propjourn.github.io/site/static/о_воспитательном_значении_текстологической_работы.html",
  },
  {
    title: "Что не так с текстологией и как исправить ситуацию",
    url: "https://propjourn.github.io/site/static/что_не_так_с_текстологией_и_как_исправить_ситуацию.html",
  },
  {
    title: "Текстология и искры",
    url: "https://vk.com/@zarya_xyz-tekstologiya-i-iskry",
  },
]

export function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/books" replace />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-body dark:bg-background">
      <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full bg-warning/5 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 h-[300px] w-[300px] rounded-full bg-success/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-primary-lg">
            <BookOpen className="h-10 w-10 text-white animate-logo-spin" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Proofreader
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Инструмент для коллективной вычитки и форматирования текстов после
            распознавания
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-gradient-primary shadow-primary-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary-lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Регистрация
              </Button>
            </Link>
          </div>
        </header>

        {/* Screenshot */}
        <section className="mt-16">
          <div className="overflow-hidden rounded-xl border border-border/50 shadow-primary-lg">
            <img
              src="/editor-screenshot.jpg"
              alt="Редактор Proofreader"
              className="w-full"
            />
          </div>
        </section>

        {/* About */}
        <section className="mt-16">
          <p className="text-lg leading-relaxed text-foreground/90">
            Самая трудоёмкая часть оцифровки — вычитка и форматирование текста
            после распознавания. Чтобы делать это коллективно, нужны специальные
            инструменты.{" "}
            <a
              href="https://dk.comtext.space/2012-1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Сборник «Ильенковские чтения» 2012 года
            </a>{" "}
            — первая книга, целиком вычитанная через Пруфридер.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/90">
            Сейчас мы активно{" "}
            <a
              href="https://github.com/comtextspace/proofreader"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              разрабатываем проект и добавляем новые функции
            </a>
            . Обзор функций и примеров работы —{" "}
            <a
              href="https://research.comtext.space/proofreader-guide2.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              в инструкции
            </a>
            .
          </p>
        </section>

        {/* Features */}
        <section className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Что умеет Пруфридер
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Access */}
        <section className="mt-16 rounded-xl border border-border/50 bg-card p-8 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Как получить доступ</h2>
          <p className="text-muted-foreground">
            Доступ пока ограничен. Чтобы получить код для регистрации, напишите в{" "}
            <a
              href="https://defcon.social/@pensadoj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Mastodon
            </a>
            .
          </p>
        </section>

        {/* Articles */}
        <section className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Статьи о текстологии
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <a
                key={article.title}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                <span className="text-sm font-medium transition-colors group-hover:text-primary">
                  {article.title}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/50 pt-8 pb-12 text-center">
          <a
            href="https://github.com/comtextspace/proofreader"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}
