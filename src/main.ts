import './style.css'
import { searchCityWeather } from './services/openMeteo'
import { searchForm, searchInput } from './ui/elements'
import { renderEmpty, renderLoading, renderNotFound, renderResult, setFormDisabled } from './ui/render'

// Identifica a busca mais recente; respostas de buscas anteriores são descartadas (RF06)
let requestId = 0

async function handleSearch(event: SubmitEvent): Promise<void> {
  event.preventDefault()

  const name = searchInput.value.trim()
  if (!name) return

  const currentId = ++requestId
  setFormDisabled(true)
  renderLoading()

  try {
    const result = await searchCityWeather(name)
    if (currentId !== requestId) return

    if (result) {
      renderResult(result)
    } else {
      renderNotFound(name)
    }
  } catch {
    if (currentId === requestId) renderNotFound(name)
  } finally {
    // Só a busca mais recente devolve o controle do formulário
    if (currentId === requestId) {
      setFormDisabled(false)
      searchInput.focus()
    }
  }
}

searchForm.addEventListener('submit', handleSearch)

renderEmpty()
