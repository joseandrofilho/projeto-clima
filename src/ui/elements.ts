// Busca um elemento pelo id e confere o tipo; falha cedo se a estrutura do index.html mudar
function getElement<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Elemento #${id} não encontrado ou com tipo inesperado.`);
  }
  return element;
}

export const searchForm = getElement('search-form', HTMLFormElement);
export const searchInput = getElement('search-input', HTMLInputElement);
export const searchButton = getElement('search-button', HTMLButtonElement);
export const resultCard = getElement('result-card', HTMLElement);
