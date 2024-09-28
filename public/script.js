const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJETO = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
const URL_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true";
let objectIDsGlobal = []; // Guardar los IDs globalmente
let currentPage = 1; // Página actual

// Función para cargar los departamentos en el selector
function fetchDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
        .then((response) => response.json())
        .then((data) => {
            const departamentoSelect = document.getElementById("departamento");
            data.departments.forEach((departamento) => {
                const option = document.createElement("option");
                option.value = departamento.departmentId;
                option.textContent = departamento.displayName;
                departamentoSelect.appendChild(option);
            });
        });
}

function translateText(text) {
    return fetch("/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        source: "en",
        target: "es",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la traducción");
        }
        return response.json();
      })
      .then((data) => data.translation)
      .catch((error) => {
        console.error("Error al traducir el texto:", error);
        return text;
      });
  }
  
// Función para mostrar los objetos en una grilla
async function fetchObjetos(objectIDs) {
    const fetchPromises = objectIDs.map(async objectId => {
        const response = await fetch(URL_OBJETO + objectId);
        const data = await response.json();
        console.log(data);
        // Validar y traducir datos necesarios
        const translatedTitle = data.title ? await translateText(data.title) : 'Sin título';
        const translatedCulture = data.culture ? await translateText(data.culture) : 'Sin dato';
        const translatedDynasty = data.dynasty ? await translateText(data.dynasty) : 'Sin dato';
        
        return `
            <div class="objeto">
                <img src="${data.primaryImageSmall !== '' ? data.primaryImageSmall : 'sinImagen.jpg'}" 
                     title="Fecha de creación: ${data.objectDate}">
                <h4 class="titulo">${translatedTitle}</h4>
                <h6 class="cultura">${translatedCulture}</h6>
                <h6 class="dinastia">${translatedDynasty}</h6>
                ${data.additionalImages.length > 0 ? `<button onclick="window.open('/ver-imagenes-adicionales.html?id=${data.objectID}', '_blank');">Ver más imágenes</button>` : ''}
            </div>`;
    });

    // Espera que todas las promesas se completen
    Promise.all(fetchPromises).then(htmlArray => {
        // Unir el HTML generado para cada objeto
        document.getElementById("grilla").innerHTML = htmlArray.join('');
    });
}


// Función para buscar objetos según los filtros aplicados
document.getElementById("buscar").addEventListener("click", (event) => {
    event.preventDefault();
    
    const departamento = document.getElementById("departamento").value;
    const keyword = document.getElementById("keyword").value;
    const localizacion = document.getElementById("localizacion").value;

    let urlBusqueda = `${URL_SEARCH}`;

    if (departamento) {
        urlBusqueda += `&departmentId=${departamento}`;
    }
    if (keyword) {
        urlBusqueda += `&q=${keyword}`;
    }
    if (localizacion) {
        urlBusqueda += `&q=${localizacion}`;
    }

    fetch(urlBusqueda)
        .then((response) => response.json())
        .then((data) => {
            // Limitar a los primeros 100 resultados
            objectIDsGlobal = data.objectIDs.slice(0, 100); 
            currentPage = 1; 
            mostrarPagina(currentPage);
            agregarPaginacion(objectIDsGlobal.length);  
        });
});

// Función para mostrar una página de resultados
function mostrarPagina(pagina) {
    const startIndex = (pagina - 1) * 20;
    const endIndex = pagina * 20;
    const objectIDsPagina = objectIDsGlobal.slice(startIndex, endIndex);
    fetchObjetos(objectIDsPagina);
}


function agregarPaginacion(totalObjetos) {
    const totalPaginas = Math.ceil(totalObjetos / 20); 
    const paginacionDiv = document.getElementById("paginacion");
    paginacionDiv.innerHTML = ''; 

    for (let i = 1; i <= totalPaginas; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.addEventListener("click", () => {
            currentPage = i;
            mostrarPagina(i);
        });
        paginacionDiv.appendChild(button);
    }
}


function mostrarImagenesAdicionales(objectID) {
    window.location.href = `/ver-imagenes-adicionales.html?id=${objectID}`;
}

fetchDepartamentos();
