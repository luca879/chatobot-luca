document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // --- CLAVE DE API DE GOOGLE AI STUDIO ---
    // ¡IMPORTANTE! Reemplaza 'TU_API_KEY_DE_GOOGLE_AI_STUDIO' con tu clave real.
    const API_KEY = 'AIzaSyDqwJsasq6ISGoiBlthj13UH8mDekE5Bxo';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    // --- BASE DE CONOCIMIENTO (La información sobre Luca) ---
    const knowledgeBase = `
        Información sobre Luca:
        - Promedio general actual: 9.13
        - Modalidad en el colegio: Economía y gestión.
        - Trayecto escolar: Bueno y fluido, sin dificultades. Le gustan matemática y proyecto. Nunca desaprobó materias.
        - Relación con profesores y compañeros: Muy buena y dinámica con profesores, basada en el respeto. Grupo de compañeros unido, con quienes tiene planes fuera del colegio.
        - Logros académicos: Participó en 2024 en la competición de economía "Formando emprendedores" (Sede regional Victoria), obteniendo el primer puesto en la primera etapa con su equipo.
        - Carrera elegida: Ingeniería en Inteligencia Artificial. La eligió por su fascinación por el poder de la IA y la tecnología para crear soluciones eficientes y automáticas.
        - Hobbies e intereses: Entrenamiento en el gimnasio, lo que le enseñó disciplina, constancia y paciencia. Está realizando un curso de programación con Python e IA.
        - Aspiraciones y metas: Formar parte de un equipo de trabajo que diseñe proyectos y soluciones a grandes problemas (ambientales, energéticos, económicos). También aspira a viajar y conocer otras culturas.
        - Rutina diaria: Se levanta a las 6am, va al colegio, a veces a inglés, luego al gimnasio y por la tarde/noche hace tareas o el curso de programación.
        - Experiencia de superación personal: Se hizo cargo de su hermana menor tras la separación de sus padres, ayudándola en diversos aspectos. Aprendió a no desesperarse ante los problemas, sino a enfocarse en la solución.
        - Personalidad: Se describe como inquieto, con iniciativa y extrovertido. Le gusta aprender por su cuenta y trabajar en equipo.
        - Fortalezas: Disciplina, curiosidad y capacidad de organización.
        - Debilidades: A veces se suma a muchas actividades y le cuesta organizarse, pero lo mejora planificando y priorizando. Le cuesta centrarse en los detalles, pero trabaja en ello eliminando distracciones.
        - Objetivo en la universidad: Formarse en Ingeniería en IA en la Universidad de San Andrés para desarrollar su potencial. Una beca es fundamental para poder acceder a la carrera.
        - Visión a futuro: Emprender y ganar experiencia laboral, compartiendo el conocimiento adquirido.
    `;

    // --- FUNCIÓN PARA ENVIAR MENSAJES A LA IA ---
    const getAiResponse = async (question) => {
        // Instrucciones para la IA
        const prompt = `
            Basándote ESTRICTA Y ÚNICAMENTE en el siguiente texto de "Información sobre Luca", responde la pregunta del usuario.
            - Tu única fuente de información es el texto proporcionado. No inventes nada.
            - Si la respuesta a la pregunta no se encuentra en el texto, debes responder EXACTAMENTE con la siguiente frase, sin añadir nada más: "esa información no esta disponible en la base de datos, contáctate con luca para saber mas al respecto sobre tu pregunta"
            - Sé directo y conciso en tu respuesta.

            --- TEXTO DE REFERENCIA ---
            ${knowledgeBase}
            --- FIN DEL TEXTO ---

            PREGUNTA DEL USUARIO: "${question}"
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
            }

            const data = await response.json();
            // Acceso seguro a la respuesta de la IA
            const botResponse = data.candidates[0]?.content?.parts[0]?.text || "No pude procesar la respuesta.";
            return botResponse.trim();

        } catch (error) {
            console.error('Error al contactar la API de Gemini:', error);
            return 'Hubo un error al conectar con la inteligencia artificial. Inténtalo de nuevo más tarde.';
        }
    };

    // --- FUNCIONES DEL CHAT ---
    const addMessage = (message, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll hacia abajo
    };
    
    const showLoadingIndicator = () => {
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('chat-message', 'bot-message', 'loading');
        loadingElement.setAttribute('id', 'loading-indicator');
        loadingElement.innerHTML = '<div class="dot-flashing"></div>';
        chatBox.appendChild(loadingElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const hideLoadingIndicator = () => {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            chatBox.removeChild(loadingIndicator);
        }
    };
    
    const handleSendMessage = async () => {
        const question = userInput.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        userInput.value = '';
        showLoadingIndicator();

        const response = await getAiResponse(question);
        
        hideLoadingIndicator();
        addMessage(response, 'bot');
    };
    
    const displayInitialQuestions = () => {
         const initialMessage = `¡Hola! Soy un asistente virtual creado para responder preguntas sobre Luca. ¿Cómo puedo ayudarte?

Aquí tienes algunas preguntas que puedo responder:
1. ¿Qué carrera eligió Luca y por qué?
2. ¿Cuáles son sus principales hobbies o actividades?
3. ¿Tuvo algún logro académico importante?
4. ¿Cuáles son sus fortalezas y debilidades?
5. ¿Qué aspiraciones tiene para su futuro profesional?`;
        addMessage(initialMessage, 'bot');
    };

    // --- EVENT LISTENERS ---
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // --- INICIAR CHAT ---
    displayInitialQuestions();
});
