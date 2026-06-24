const vscode = require("vscode");

function activate(context) {
  let hoverProvider = vscode.languages.registerHoverProvider("boolepad", {
    provideHover(document, position) {
      // 1. Obtener la palabra bajo el cursor
      const range = document.getWordRangeAtPosition(
        position,
        /([a-zA-Z_][a-zA-Z0-9_]*|<-)/,
      );
      if (!range) return null;
      const word = document.getText(range).trim();

      if (!word || /^\d+$/.test(word)) return null;

      // =========================================================================
      // 📚 BLOQUE 1: DICCIONARIO TEÓRICO (Tooltip)
      // =========================================================================
      const teoria = {
        inicializar: {
          titulo: "Acción `Inicializar`",
          definicion:
            "Es el primer bloque ejecutable del algoritmo (`A0`). Se encarga de dejar el sistema en un estado inicial conocido, asignando los valores de partida a los acumuladores, contadores y variables de control antes de procesar los datos principales.",
          sintaxis:
            "Inicializar\n  contador <- 0\n  suma <- 0\nFin_Inicializar",
          ejemplo: "Inicializar\n  contador <- 0\n  suma <- 0\nFin_Inicializar",
          uso: "Prepara el estado del programa antes de comenzar la lógica principal.",
          consejo:
            "Incluye todas las variables necesarias y asigna valores iniciales claros.",
        },
        parar: {
          titulo: "Acción `Parar`",
          definicion:
            "Es el último bloque secuencial del algoritmo principal. Indica la finalización formal de la ejecución del programa una vez que todos los datos han sido procesados y los resultados fueron comunicados.",
          sintaxis: "Parar",
          ejemplo: "Parar",
          uso: "Finaliza el algoritmo cuando ya no hay más pasos por ejecutar.",
          consejo:
            "Colócala al final del flujo para que el algoritmo quede correctamente cerrado.",
        },
        si: {
          titulo: "Estructura de Selección (Condicional)",
          definicion:
            "Evalúa una condición booleana. Si el resultado es **Verdadero**, ejecuta el bloque de código que le sigue. Permite desviar el flujo lineal del programa según los datos del momento.",
          sintaxis: "Si (condición) Entonces\n  ...\nFin_Si",
          ejemplo:
            'Si (edad >= 18) Entonces\n  escribir("Mayor de edad")\nFin_Si',
          uso: "Usa `Si` cuando quieras ejecutar código solo si se cumple una condición.",
          consejo:
            "Evita condicionales muy complejos; divide condiciones en pasos más simples.",
        },
        entonces: {
          titulo: "Palabra Clave: `Entonces`",
          definicion:
            "Sintaxis obligatoria que conecta la condición de un `Si` con el bloque de acciones que deben ejecutarse si dicha condición se cumple.",
          sintaxis: "Si (condición) Entonces",
          ejemplo: "Si (numero > 0) Entonces",
          uso: "Debe aparecer después de la condición en una estructura `Si`.",
          consejo:
            "No la omitas, ya que define claramente el inicio del bloque verdadero.",
        },
        sino: {
          titulo: "Cláusula: `Sino`",
          definicion:
            "Define un camino alternativo obligatorio para la estructura `Si`. El bloque dentro del `Sino` se ejecutará única y exclusivamente si la condición evaluada resultó ser **Falsa**.",
          sintaxis: "Si (condición) Entonces\n  ...\nSino\n  ...\nFin_Si",
          ejemplo:
            'Si (aprobado) Entonces\n  escribir("Aprobado")\nSino\n  escribir("Reprobado")\nFin_Si',
          uso: "Usa `Sino` cuando necesitas manejar tanto la rama verdadera como la falsa.",
          consejo:
            "Mantén las dos ramas cortas para que el condicional sea fácil de entender.",
        },
        fin_si: {
          titulo: "Cierre de Condicional `Si`",
          definicion:
            "Marca el final de una estructura `Si` o `Si...Sino` y evita que el flujo siga dentro del bloque condicional.",
          sintaxis: "Fin_Si",
          uso: "Siempre debe usarse para cerrar un condicional.",
          consejo:
            "Asegúrate de que cada `Si` tiene su `Fin_Si` correspondiente.",
        },
        mientras: {
          titulo: "Estructura de Iteración Condicional (Bucle)",
          definicion:
            "Repite un bloque de acciones *mientras* la condición evaluada sea **Verdadera**. Es un bucle de tipo **Pre-test**, lo que significa que si la condición es falsa de entrada, las acciones de su interior jamás se ejecutarán.",
          sintaxis: "Mientras (condición) Hacer\n  ...\nFin_Mientras",
          ejemplo:
            "mientras (contador < 10) Hacer\n  contador <- contador + 1\nFin_Mientras",
          uso: "Buena para repetir acciones hasta que se cumpla una condición de salida.",
          consejo:
            "Verifica la condición de salida para evitar bucles infinitos.",
        },
        hacer: {
          titulo: "Palabra Clave: `Hacer`",
          definicion:
            "Delimita el inicio del cuerpo de acciones en las estructuras de iteración (`Mientras`) y en ciclos de conteo fijo.",
          sintaxis: "Mientras (condición) Hacer",
          ejemplo: "Mientras (i <= 5) Hacer",
          uso: "Se usa para iniciar el bloque que se repite en un bucle.",
          consejo: "No confundir con `Fin_Mientras`, que cierra el bucle.",
        },
        fin_mientras: {
          titulo: "Cierre de Bucle `Mientras`",
          definicion:
            "Marca el fin del bloque repetitivo en una estructura `Mientras`.",
          sintaxis: "Fin_Mientras",
          uso: "Siempre debe usarse para cerrar el bucle.",
          consejo:
            "Colócalo en la misma identación que `Mientras` para mayor claridad.",
        },
        leer: {
          titulo: "Función de `Entrada`: Leer",
          definicion:
            "Asigna un valor a una variable interrumpiendo el flujo para recibir un dato externo (introducido por el usuario o proveniente de un lote de entrada).",
          sintaxis: "Leer(variable)",
          ejemplo: "Leer(edad)",
          uso: "Utiliza `Leer` para cargar datos desde el usuario o el conjunto de entrada.",
          consejo: "Asegúrate de declarar la variable antes de leerla.",
        },
        escribir: {
          titulo: "Función de `Salida`: Escribir",
          definicion:
            "Muestra información en el dispositivo de salida (pantalla). Puede imprimir mensajes constantes entre comillas, valores actuales de variables o combinaciones de ambos.",
          sintaxis: "Escribir(texto)",
          ejemplo: 'Escribir("Resultado: ", total)',
          uso: "Sirve para comunicar resultados, mensajes y valores intermedios.",
          consejo:
            "Usa mensajes claros para facilitar la lectura de la salida.",
        },
        mf: {
          titulo: "Marca Final (`MF`)",
          definicion:
            "Valor constante especial utilizado para indicar el fin de un lote de datos de entrada. El algoritmo utiliza esta marca en sus condiciones de control para saber cuándo detener la lectura.",
          sintaxis: "MF = (valor)",
          ejemplo: "MF = (0)",
          uso: "Emplea `MF` cuando necesitas una señal de fin de datos.",
          consejo:
            "Elije un valor que no pueda aparecer como dato válido en la entrada.",
        },
        funcion: {
          titulo: "Modularización: `Función`",
          definicion:
            "Subprograma que recibe parámetros, ejecuta un proceso algorítmico aislado y **retorna obligatoriamente un único valor** al módulo que la invocó.",
          sintaxis: "Funcion nombre(parametros)\n  ...\nFin_Funcion",
          ejemplo: "Funcion sumar(a, b)\n  sumar <- a + b\nFin_Funcion",
          uso: "Usa funciones para encapsular lógica que devuelve un resultado.",
          consejo:
            "Mantén las funciones enfocadas en una sola responsabilidad.",
        },
        fin_funcion: {
          titulo: "Cierre de `Función`",
          definicion:
            "Indica el fin de un bloque de función y devuelve el control al módulo que la invocó.",
          sintaxis: "Fin_Funcion",
          uso: "Siempre debe usarse para cerrar una función.",
          consejo:
            "Comprueba que el valor retornado esté bien asignado dentro de la función.",
        },
        procedimiento: {
          titulo: "Modularización: `Procedimiento`",
          definicion:
            "Subprograma o módulo independiente que ejecuta una tarea específica. A diferencia de las funciones, **no retorna un valor directo**, sino que genera efectos mediante parámetros por referencia o acciones de E/S.",
          sintaxis:
            "Procedimiento nombre(parametros)\n  ...\nFin_Procedimiento",
          ejemplo:
            "Procedimiento mostrarMensaje(texto)\n  Escribir(texto)\nFin_Procedimiento",
          uso: "Usa procedimientos para acciones que no necesitan devolver un valor.",
          consejo:
            "Ideal para pasos repetidos que sólo afectan el estado o la salida.",
        },
        fin_procedimiento: {
          titulo: "Cierre de `Procedimiento`",
          definicion:
            "Marca el fin de un procedimiento y devuelve el control al código que lo llamó.",
          sintaxis: "Fin_Procedimiento",
          uso: "Cierra siempre el bloque del procedimiento.",
          consejo:
            "Mantén el cuerpo del procedimiento separado de la lógica principal.",
        },
        segun: {
          titulo: "Estructura de Selección Múltiple (Switch / Case)",
          definicion:
            "Evalúa una expresión y permite ejecutar diferentes bloques de código según el valor resultante. Cada caso es mutuamente exclusivo, y se ejecuta únicamente el bloque correspondiente al valor coincidente.",
          sintaxis:
            "Segun <expresión> Hacer\n  Caso <valor>\n    ...\n  Otro\n    ...\nFin_Segun",
          ejemplo:
            'Segun opcion Hacer\n  Caso 1\n    escribir("Uno")\n  Otro\n    escribir("Otro")\nFin_Segun',
          uso: "Elige `Segun` cuando hay varios caminos posibles basados en un mismo valor.",
          consejo:
            "Prefiere `Segun` frente a muchos `Si` anidados para mayor claridad.",
        },
        caso: {
          titulo: "Cláusula: `Caso`",
          definicion:
            "Define una rama específica dentro de una estructura `Segun` que se ejecuta si la expresión coincide con el valor indicado.",
          sintaxis: "Caso valor:",
          ejemplo: "Caso 1",
          uso: "Se usa dentro de `Segun` para separar cada alternativa.",
          consejo:
            "No repitas condiciones; `Segun` selecciona la primera coincidencia.",
        },
        otro: {
          titulo: "Cláusula: `Otro`",
          definicion:
            "Define la rama por defecto dentro de una estructura `Segun`. Se ejecuta cuando ningún `Caso` coincide.",
          sintaxis: "Otro",
          ejemplo: "Otro",
          uso: "Incluye siempre una rama `Otro` para manejar valores inesperados.",
          consejo: "Úsalo como fallback seguro cuando no hay coincidencias.",
        },
        fin_segun: {
          titulo: "Cierre de Selección Múltiple",
          definicion:
            "Marca el fin de una estructura `Segun` y evita que las instrucciones siguientes sean interpretadas como parte de ella.",
          sintaxis: "Fin_Segun",
          uso: "Cierra la estructura `Segun` obligatoriamente.",
          consejo: "Alinea `Fin_Segun` con `Segun` para una lectura más clara.",
        },
        // OPERADORES Y ASIGNACIONES
        "<-": {
          titulo: "Operador de Asignación",
          definicion:
            "Asigna un valor a una variable. Se utiliza para guardar resultados de cálculos, lecturas o constantes en la memoria del algoritmo.",
          sintaxis: "variable <- expresión",
          ejemplo: "suma <- a + b",
          uso: "Usa `<-` cada vez que quieras actualizar una variable.",
          consejo:
            "El lado izquierdo debe ser una variable declarada previamente.",
        },
        variable: {
          titulo: "Declaración de Variable",
          definicion:
            "Define una variable auxiliar que el algoritmo usará para almacenar datos temporales.",
          sintaxis: "Variable nombre : Tipo",
          ejemplo: "Variable contador : Entero",
          uso: "Declara variables antes de asignarles valores o usarlas en cálculos.",
          consejo:
            "Elige nombres descriptivos para facilitar la lectura del algoritmo.",
        },
        constante: {
          titulo: "🔒 Declaración de Constante",
          definicion:
            "Define un valor fijo que no cambiará durante la ejecución del algoritmo.",
          sintaxis: "Constante nombre = valor",
          ejemplo: "Constante PI = 3.14",
          uso: "Usa constantes para valores que permanecen iguales, como límites o marcas de fin.",
          consejo:
            "Utiliza constantes para evitar repetir valores mágicos en el código.",
        },
        entradas: {
          titulo: "Sección de `Entradas`",
          definicion:
            "Bloque donde se declaran las variables leídas desde la entrada del algoritmo.",
          ejemplo: "Entradas\n  edad : Entero\n  nombre : Cadena",
          uso: "Define aquí las variables que recibirá el algoritmo desde el usuario o el lote de datos.",
          consejo:
            "Separa claramente las entradas de las salidas y las variables auxiliares.",
        },
        salidas: {
          titulo: "Sección de `Salidas`",
          definicion:
            "Bloque donde se declaran las variables que el algoritmo devolverá o mostrará como resultado.",
          ejemplo: "Salidas\n  total : Entero",
          uso: "Explica los datos que el algoritmo entregará al finalizar.",
          consejo: "Incluye solo los resultados relevantes.",
        },
        // TIPOS DE DATOS
        entero: {
          titulo: "Tipo de Dato: `Entero`",
          definicion:
            "Representa números sin parte decimal, usados en cálculos y contadores.",
          ejemplo: "Variable cantidad : Entero",
          uso: "Usa `Entero` cuando no necesitas decimales.",
          consejo: "Evita usarlo si el dato puede incluir fracciones.",
        },
        real: {
          titulo: "Tipo de Dato: `Real`",
          definicion:
            "Representa números con parte decimal y valores más precisos.",
          ejemplo: "Variable precio : Real",
          uso: "Usa `Real` para cantidades que pueden tener decimales.",
          consejo: "Ten cuidado con la precisión en cálculos financieros.",
        },
        natural: {
          titulo: "Tipo de Dato: `Natural`",
          definicion: "Representa números enteros no negativos (0, 1, 2, ...).",
          ejemplo: "Variable edad : Natural",
          uso: "Usa `Natural` para contar elementos o representar edades.",
          consejo:
            "No lo uses para valores negativos; considera `Entero` si es necesario.",
        },
        racional: {
          titulo: "Tipo de Dato: `Racional`",
          definicion:
            "Representa números que pueden expresarse como una fracción de dos enteros.",
          ejemplo: "Variable proporción : Racional",
          uso: "Usa `Racional` para representar valores que involucran fracciones.",
          consejo:
            "Es útil en cálculos matemáticos donde se requiere precisión en las fracciones.",
        },
        irracional: {
          titulo: "Tipo de Dato: `Irracional`",
          definicion:
            "Representa números que no pueden expresarse como una fracción exacta de dos enteros, como π o √2.",
          ejemplo: "Variable pi : Irracional",
          uso: "Usa `Irracional` para cálculos que requieren valores como π o raíces cuadradas.",
          consejo:
            "Ten en cuenta que los valores irracionales se aproximan en la práctica.",
        },
        cadena: {
          titulo: "Tipo de Dato: `Cadena`",
          definicion:
            "Representa secuencias de caracteres, como palabras o frases.",
          ejemplo: "Variable nombre : Cadena",
          uso: "Usa `Cadena` para almacenar texto.",
          consejo:
            "No lo uses para cálculos; es solo para datos alfanuméricos.",
        },
        caracter: {
          titulo: "Tipo de Dato: `Caracter`",
          definicion: "Representa un símbolo o letra individual.",
          ejemplo: "Variable letra : Caracter",
          uso: "Usa `Caracter` para almacenar un solo carácter.",
          consejo:
            "No lo uses para cadenas completas; emplea un tipo de cadena si existe.",
        },
        logico: {
          titulo: "Tipo de Dato: `Lógico`",
          definicion: "Representa valores booleanos: verdadero o falso.",
          ejemplo: "Variable activo : Logico",
          uso: "Usa `Logico` para condiciones y banderas de control.",
          consejo: "Es ideal para comparaciones y decisiones.",
        },
        booleano: {
          titulo: "Tipo de Dato: `Booleano`",
          definicion: "Representa valores booleanos: verdadero o falso.",
          ejemplo: "Variable activo : Booleano",
          uso: "Usa `Booleano` para condiciones y banderas de control.",
          consejo: "Es ideal para comparaciones y decisiones.",
        },
        verdadero: {
          titulo: "Literal Booleano: `Verdadero`",
          definicion: "Valor booleano que representa la condición afirmativa.",
          ejemplo: "esMayor <- verdadero",
          uso: "Se usa en expresiones lógicas y condiciones.",
          consejo: "Compáralo con `falso` para expresiones claras.",
        },
        falso: {
          titulo: "Literal Booleano: `Falso`",
          definicion: "Valor booleano que representa la condición negativa.",
          ejemplo: "continuar <- falso",
          uso: "Se usa para indicar ausencia de verdad en condiciones.",
          consejo: "Úsalo en controles de flujo y banderas de estado.",
        },
      };

      const wordLower = word.toLowerCase();

      // Si es un código de refinamiento (A0, A1, A2...) damos una explicación genérica de refinamientos
      if (/^A[0-9]+$/i.test(word)) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(
          `### 🔍 Identificador de Refinamiento (${word.toUpperCase()})\n`,
        );
        markdown.appendMarkdown(`--- \n`);
        markdown.appendMarkdown(
          `Representa un bloque de acciones o subproblema dentro del esquema de **Refinamientos Secuenciales**. Ayuda a descomponer el problema principal en pasos lógicos más simples y ordenados.`,
        );
        return new vscode.Hover(markdown);
      }

      // Si la palabra existe en el diccionario conceptual, mostramos la teoría al toque
      if (teoria[wordLower]) {
        const item = teoria[wordLower];
        const markdown = new vscode.MarkdownString();

        markdown.isTrusted = true;

        markdown.appendMarkdown(`### ${item.titulo}\n`);
        markdown.appendMarkdown(`--- \n`);
        markdown.appendMarkdown(`${item.definicion}\n\n`);

        if (item.sintaxis) {
          markdown.appendMarkdown(`**Sintaxis:**\n`);
          // Dejamos línea en blanco y aplicamos '>' para encajonar
          markdown.appendMarkdown(
            `> \n> \`\`\`boolepad\n> ${item.sintaxis.replace(/\n/g, "\n> ")}\n> \`\`\`\n\n`,
          );
        }

        if (item.ejemplo) {
          markdown.appendMarkdown(`**Ejemplo:**\n`);
          // Dejamos línea en blanco y aplicamos '>' para encajonar
          markdown.appendMarkdown(
            `> \n> \`\`\`boolepad\n> ${item.ejemplo.replace(/\n/g, "\n> ")}\n> \`\`\`\n\n`,
          );
        }

        if (item.uso) {
          markdown.appendMarkdown(`**Uso:** ${item.uso}\n\n`);
        }

        if (item.consejo) {
          markdown.appendMarkdown(`---\n💡 **Consejo:** ${item.consejo}\n`);
        }

        return new vscode.Hover(markdown);
      }

      // Ignoramos solo palabras muy genéricas que no llevan tooltip específico
      const ignoreKeywords = [
        "de",
        "en",
        "y",
        "o",
        "a",
        "con",
        "para",
        "el",
        "la",
        "los",
        "las",
      ];
      if (ignoreKeywords.includes(wordLower)) return null;

      // =========================================================================
      // 🧮 BLOQUE 2: MOTOR DE ANÁLISIS DE VARIABLES (Código Secuencial)
      // =========================================================================
      const text = document.getText();
      const lines = text.split(/\r?\n/);

      let detectedType = null;
      let sectionFound = null;
      let currentSection = null;

      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const line = lines[i];
        if (/\bentradas?\b/i.test(line)) currentSection = "Entrada";
        else if (/\bsalidas?\b/i.test(line)) currentSection = "Salida";
        else if (/\bconstantes?\b/i.test(line)) currentSection = "Constante";
        else if (/\bvariables?\b/i.test(line))
          currentSection = "Variable Auxiliar";

        if (line.includes(word)) {
          const regex = new RegExp(
            `\\b${word}\\b\\s*.*:\\s*([a-zA-ZáéíóúÁÉÍÓÚ]+)`,
            "i",
          );
          const match = line.match(regex);
          if (match) {
            detectedType = match[1].toLowerCase();
            sectionFound = currentSection;
            break;
          }
        }
      }

      if (!detectedType || !sectionFound) return null;

      let memory = {};

      for (let i = 0; i <= position.line; i++) {
        let line = lines[i].split("//")[0].trim();

        let mfMatch = line.match(/\b(MF)\s*=\s*([0-9]+)/i);
        if (mfMatch) {
          memory[mfMatch[1].toUpperCase()] = mfMatch[2];
        }

        let leerMatch = line.match(
          /\bleer\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/i,
        );
        if (leerMatch) {
          memory[leerMatch[1]] = "Dinámico (Entrada del usuario)";
        }

        let assignMatch = line.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*<-\s*(.+)/);
        if (assignMatch) {
          let varName = assignMatch[1].trim();
          let expr = assignMatch[2].trim();

          let wordsInExpr = expr.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
          let resolvedExpr = expr;
          let isDynamic = false;

          for (let w of wordsInExpr) {
            if (memory[w] !== undefined) {
              if (String(memory[w]).includes("Dinámico")) {
                isDynamic = true;
              }
              resolvedExpr = resolvedExpr.replace(
                new RegExp(`\\b${w}\\b`, "g"),
                memory[w],
              );
            } else {
              isDynamic = true;
            }
          }

          if (isDynamic) {
            memory[varName] = "Dinámico (Depende de variables de entrada)";
          } else {
            try {
              if (/^[0-9\s\+\-\*\/()]+$/.test(resolvedExpr)) {
                memory[varName] = Function(`return ${resolvedExpr}`)();
              } else {
                memory[varName] = resolvedExpr;
              }
            } catch (e) {
              memory[varName] = expr;
            }
          }
        }
      }

      let finalValue = "No inicializado (Basura en memoria)";
      if (memory[word] !== undefined) {
        finalValue = memory[word];
      } else if (sectionFound === "Entrada") {
        finalValue = "Variable de Entrada (Se define al ejecutar)";
      }

      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`### 📋 boolepad - Análisis de Variables\n`);
      markdown.appendMarkdown(`--- \n`);
      markdown.appendMarkdown(`* **Nombre:** \`${word}\`\n`);
      markdown.appendMarkdown(`* **Rol:** *${sectionFound}*\n`);
      markdown.appendMarkdown(
        `* **Tipo:** \`${detectedType.toUpperCase()}\`\n`,
      );
      markdown.appendMarkdown(`* **Valor en esta línea:** \`${finalValue}\`\n`);

      return new vscode.Hover(markdown);
    },
  });

  context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = { activate, deactivate };
