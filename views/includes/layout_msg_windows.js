// MODAL ADMINLTE - 1.0 -->
// Funciones que manipulan ventanas de mensajes MODALES mediante jquery

var onReloadPage = false; //Usada para indicar despues del close del Boton del modal recargue la 
                          //página solo si la operacion fue exitosa y requiere recargar

function msgShow_Simple(msgTitle, info, showLoading){   
	  //info= mensaje a mostrar   showLoading=1:mostar loading.gif 0:ocultar   colorStyle=resetear fondo de contenido         				
	$("#modalstyle").removeClass("bg-primary bg-danger bg-success bg-info  bg-warning bg-default text-white text-dark");

	var codeMsg = info.substring(0, 1);
	var mensaje = info.substring(2, info.length); 
	if ((codeMsg == 1) || (codeMsg == 2)){  //Ocurrio algun error de acceso o de ejecucion ventana ROJA
		$("#modalstyle").addClass("bg-danger text-white");
	}else {
		if (codeMsg == 0) {
			 $("#modalstyle").addClass("bg-success text-white"); //Ocurrio todo bn ventana VERDE
			 onReloadPage = true; 
		}else{ 

			if(codeMsg == 3) {  //Ocurrio algo parcial ventana AZUL
				$("#modalstyle").addClass("bg-info text-white"); 
			}else{
				$("#modalstyle").addClass("bg-default");
			}
		}
	}

	$("#msgTitle").html(msgTitle);
	if (showLoading==0){ // no muestra Losding sino mensaje			
		$("#msgContent").html(mensaje);
	}else{ //Muestra loading, se usa en los preenvios
		//$("#msgContent").html(loading);  
	}
	$("#msg_modalWindows").modal("show");
}