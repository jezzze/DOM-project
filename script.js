// Odotetaan, että DOM-puu on kokonaan ladattu ennen koodin suorittamista
document.addEventListener("DOMContentLoaded", function () {
    
    // HTML-elementtien valinta 
    const todoForm = document.getElementById("todo-form");
    const taskInput = document.getElementById("task-input");
    const errorMessage = document.getElementById("error-message");
    const todoList = document.getElementById("todo-list");
    const openCountElement = document.getElementById("open-count");
    const filterButtons = document.querySelectorAll(".filter-btn");

    // Taulukko tehtäville (ladataan selaimen muistista tai alustetaan tyhjäksi)
    let tasks = [];
    let currentFilter = "all";

    // Sovelluksen alustus
    lataaTehtavatMuistista();
    paivitaNakyma();

    // Tapahtumankuuntelijat (Event Listeners) 

    // Lomakkeen lähetys (uuden tehtävän lisääminen)
    todoForm.addEventListener("submit", function (tapahtuma) {
        tapahtuma.preventDefault(); // Estetään sivun uudelleenlataus

        const teksti = taskInput.value.trim();

        // Validointi: Tyhjä tai liian lyhyt syöte
        if (teksti === "") {
            naytaVirhe("Syöte ei voi olla tyhjä!");
            return;
        }

        if (teksti.length < 3) {
            naytaVirhe("Tehtävän on oltava vähintään 3 merkkiä pitkä!");
            return;
        }

        // Jos validointi läpäistään, poistetaan mahdolliset virheet
        tyhjennaVirhe();

        // Luodaan uusi tehtävä-olio
        const uusiTehtava = {
            id: Date.now(), // Käytetään aikaleimaa yksilöllisenä ID:nä
            teksti: teksti,
            valmis: false
        };

        // Lisätään tehtävä taulukkoon ja tyhjennetään syötekenttä
        tasks.push(uusiTehtava);
        taskInput.value = "";

        // Tallennetaan ja päivitetään käyttöliittymä
        tallennaTehtavatMuistiin();
        paivitaNakyma();
    });

    // Syötekentän kuuntelija virheilmoituksen poistamiseksi kirjoitettaessa
    taskInput.addEventListener("input", function () {
        if (taskInput.value.trim().length >= 3) {
            tyhjennaVirhe();
        }
    });

    // Suodatinpainikkeiden kuuntelu
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Poistetaan active-luokka kaikilta ja lisätään klikatulle
            filterButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            currentFilter = this.getAttribute("data-filter");
            paivitaNakyma();
        });
    });

    // Funktiot

    // Näyttää virheilmoituksen ja korostaa kentän punaisella
    function naytaVirhe(viesti) {
        errorMessage.textContent = viesti;
        taskInput.classList.add("invalid");
    }

    // Poistaa virheilmoituksen ja punaisen korostuksen
    function tyhjennaVirhe() {
        errorMessage.textContent = "";
        taskInput.classList.remove("invalid");
    }

    // Päivittää tehtävälistan ja laskurin käyttöliittymään
    function paivitaNakyma() {
        // Tyhjennetään nykyinen lista DOMista
        todoList.innerHTML = "";

        // Suodatetaan tehtävät valitun suodattimen mukaan
        const suoritetutTehtavat = tasks.filter(function (tehtava) {
            if (currentFilter === "active") return !tehtava.valmis;
            if (currentFilter === "completed") return tehtava.valmis;
            return true; // "all"
        });

        // Luodaan DOM-elementit suodatetuille tehtäville
        suoritetutTehtavat.forEach(function (tehtava) {
            const li = document.createElement("li");
            li.className = `task-item ${tehtava.valmis ? "completed" : ""}`;

            // Sisältöosio (valintaruutu ja teksti)
            const contentDiv = document.createElement("div");
            contentDiv.className = "task-content";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = tehtava.valmis;
            checkbox.addEventListener("change", function () {
                vaihdaTehtavanTila(tehtava.id);
            });

            const span = document.createElement("span");
            span.className = "task-text";
            span.textContent = tehtava.teksti;

            contentDiv.appendChild(checkbox);
            contentDiv.appendChild(span);

            // Poistopainike
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Poista";
            deleteBtn.addEventListener("click", function () {
                poistaTehtava(tehtava.id);
            });

            // Kootaan elemeneistä kokonaisuus
            li.appendChild(contentDiv);
            li.appendChild(deleteBtn);

            todoList.appendChild(li);
        });

        // Päivitetään avointen tehtävien laskuri
        paivitaLaskuri();
    }

    // Vaihtaa tehtävän tilan (valmis / kesken)
    function vaihdaTehtavanTila(id) {
        tasks = tasks.map(function (tehtava) {
            if (tehtava.id === id) {
                return { ...tehtava, valmis: !tehtava.valmis };
            }
            return tehtava;
        });

        tallennaTehtavatMuistiin();
        paivitaNakyma();
    }

    // Poistaa tehtävän id:n perusteella
    function poistaTehtava(id) {
        tasks = tasks.filter(function (tehtava) {
            return tehtava.id !== id;
        });

        tallennaTehtavatMuistiin();
        paivitaNakyma();
    }

    // Laskee ja päivittää avointen (kesken olevien) tehtävien määrän
    function paivitaLaskuri() {
        const avoimet = tasks.filter(t => !t.valmis).length;
        openCountElement.textContent = avoimet;
    }

    // Tallentaa tehtävät selaimen localStorageen
    function tallennaTehtavatMuistiin() {
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
    }

    // Lataa tehtävät selaimen localStoragesta
    function lataaTehtavatMuistista() {
        const tallennetut = localStorage.getItem("todoTasks");
        if (tallennetut) {
            try {
                tasks = JSON.parse(tallennetut);
            } catch (e) {
                console.error("Virhe ladattaessa muistista:", e);
                tasks = [];
            }
        }
    }
});