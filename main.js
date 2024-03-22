// APP STATE
const mockedPosts = [{
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  },
  {
    "userId": 1,
    "id": 2,
    "title": "qui est esse",
    "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
  },
  {
    "userId": 1,
    "id": 3,
    "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
    "body": "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
  }
]
const appState = {
    header: {
        pageTitle: 'POSTS PAGE'
    },
    search: {
        label: 'Search',
        placeholder: 'tab to search',
        searchValue: '1',
    },
    main: {
        posts: {
            isFetching: true,
            value: [],
            filteredPosts: [],
            postCountOnPage: 0,
            postsOnPage: [...mockedPosts],
            nav: {
                pageNumber: 1,
                firstPageDisabled: '',
                lastPageDisabled: '',
            }
        },
    },
    footer: {
        author: 'made by Sterben'
    },
    service: {
        baseUrl: 'https://jsonplaceholder.typicode.com',
        postUrl: '/posts',
    },
    errors: '',
}

// COMPONENTS
const components = {

    header: () => `
    <header id="header"><h1>${appState.header.pageTitle}</h1></header>
    `,

    search: () => `
    <section class="search" id="search">
        <p>${appState.search.label}</p>
        <input class="search-input" id="search-input" type="search" placeholder="${appState.search.placeholder}">
    </section>`,

    main: ({ search, nav, postCard }) => `
    <main id="main">
        <section class="posts-container" id="posts-container">
            ${search}
            <div class="post-card-container" id="post-card-container">
                ${(() => {
                    if(appState.main.posts.isFetching) {
                        return components.loading();
                    } else {
                        if(appState.errors) {
                            return components.error();
                        }
                        return appState.main.posts.postsOnPage.map((posts) => postCard(posts)).join('\n');
                    }
                })()}
            </div>
            ${nav}
        </section>
    </main>
    `,

    error: () => `
    <div>
        <p>Network error:</p>
        <p>${appState.errors}</p>
        <p>please reload the page</p>
    </div>
    `,

    loading: () => `
    <div>
        <p>Loading...</p>
    </div>
    `,

    postCard: ({id, title, body}) => `
    <div class="card" id="card-${id}">
        <p>#${id}</p>
        <p>${title}</p>
        <p>${body}</p>
    </div>
    `,

    nav: () => `
    <nav>
        <button id="prev-page"  ${appState.main.posts.nav.firstPageDisabled}><<<</button>
        <div class="page-number" id="page-number">${appState.main.posts.nav.pageNumber}</div>
        <button id="next-page" ${appState.main.posts.nav.lastPageDisabled}>>>></button>
    </nav>`,
    
    footer: () => `
    <footer id="footer">${appState.footer.author}</footer>`
}


// RENDER
const render = () => {
    const root = document.querySelector('#root-container')

    root.innerHTML = `
        ${components.header()}
        ${components.main({ search: components.search(), nav: components.nav(), postCard: components.postCard })}
        ${components.footer()}
`;
}

// SERVICES

const fetchPosts = async () => {
    const mainUrl = appState.service.baseUrl + appState.service.postUrl;
    const responce = await fetch(mainUrl);
    const result = await responce.json();
    return result;
}

// CONSTANTS
const POST_CARD_HEIGHT = 316 ;
const POST_CARD_WIDTH = 296;

// ELEMENTS

let elements = {
    postCardContainer: null,
    nav: {
        nextPage: null,
        prevPage: null,
    },
    searchInput: null,
}

const getElements = () => {
     elements = {
        postCardContainer: document.querySelector('#post-card-container'),
        nav: {
            nextPage: document.querySelector('#next-page'),
            prevPage: document.querySelector('#prev-page'),
        },
        searchInput: document.querySelector('#search-input'),
    }
}

// UTILS
const getCountPostsOnPage = () => {
    const { width, height } = elements.postCardContainer.getBoundingClientRect()

    appState.main.posts.postCountOnPage = Math.floor(height / POST_CARD_HEIGHT) * Math.floor(width / POST_CARD_WIDTH)
}

const getPostsOnPage = () => {
    const startIndex = (appState.main.posts.nav.pageNumber -1) * appState.main.posts.postCountOnPage;
    const lastIndex = appState.main.posts.nav.pageNumber * appState.main.posts.postCountOnPage

    appState.main.posts.postsOnPage = appState.main.posts.value.slice(startIndex, lastIndex)
}

// LISTENERS

// HANDLERS
function increasePageNumber() {
    if(appState.main.posts.nav.pageNumber >= 1) {
        appState.main.posts.nav.pageNumber += 1;

        getPostsOnPage();

        removeEventListeners();
        render();
        getElements();
        addEventListeners();
    }   
}

function decreasePageNumber() {
    if(appState.main.posts.nav.pageNumber >= 2) {
        appState.main.posts.nav.pageNumber -= 1;

        getPostsOnPage();

        removeEventListeners();
        render();
        getElements();
        addEventListeners();
    }
}

// ADD EVENT LISTENERS
const addEventListeners = () => {
    elements.nav.nextPage.addEventListener('click', increasePageNumber);
    elements.nav.prevPage.addEventListener('click', decreasePageNumber);
}

// REMOVE EVENT LISTENERS
const removeEventListeners = () => {
    elements.nav.nextPage.removeEventListener('click', increasePageNumber);
    elements.nav.prevPage.removeEventListener('click', decreasePageNumber);
}

// APP WORK
(async () => {
    appState.main.posts.isFetching = true;
    render(); // pre-render
    getElements();

    try {
        appState.main.posts.value = await fetchPosts();
        appState.main.posts.isFetching = false;

        
    } catch(error) {
        appState.main.posts.isFetching = false;
        appState.errors = error
        render()
    }

    getCountPostsOnPage();
    getPostsOnPage();

    render();
    getElements();
    addEventListeners();
})()