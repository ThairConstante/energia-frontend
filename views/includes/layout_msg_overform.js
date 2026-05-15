// MODAL ADMINLTE - 1.0 -->
// Funciones que manipulan ventanas de mensajes MODALES mediante jquery

   function msgOverForm_Show(msgTitle, info, postName){   
        //info= mensaje a mostrar  | msgTitle=titulo dle recuadro  |   
		  //postName= nombre que direfencia el  cuadro de mensaje ya puede haber en la misma pagina varios bloques de mensajes		
		$("#msg_overform_"+postName).removeClass("alert-success alert-warning alert-default alert-danger alert-info");
		var iconres="";
		var codeMsg = info.substring(0, 1);
		var mensaje = info.substring(2, info.length); 
		if ((codeMsg == 1) || (codeMsg == 2)){  //Ocurrio algun error de acceso o de ejecucion ventana inicialmente
			$("#msg_overform_"+postName).removeClass("alert-success alert-default").addClass("alert-warning"); 			
			iconres = "<i class='glyphicon glyphicon-exclamation-sign'></i>";			 	 
			if ((codeMsg == 2)){  //Ocurrio algun error de acceso o de ejecucion ventana ROJA
				$("#msg_overform_"+postName).removeClass("alert-success alert-default alert-warning").addClass("alert-danger"); 
				iconres = "<i class='glyphicon glyphicon-remove-sign'></i>";			 	 
			}
	    }else {
			if (codeMsg == 0) {  //Ocurrio todo bn ventana VERDE
				 $("#msg_overform_"+postName).removeClass("alert-warning").addClass("alert-success"); 
				 iconres = "<i class='glyphicon glyphicon-ok-sign'></i>";			 	 
			}else{ // funciona cuando es -1 ausencia de colores de fondo en contenido es informacion general		
				$("#msg_overform_"+postName).removeClass("alert-success alert-warning").addClass("alert-default");
			 	iconres = "<i class='glyphicon glyphicon-info-sign'></i>";	
				 
			}
		}

		$("#msgTitle_"+postName).html(msgTitle);
		$("#msgContent_"+postName).html(iconres+" "+mensaje);
		
		$("#msg_overform_"+postName).slideDown(500);
		$("#msg_overform_"+postName).delay(8000);
		$("#msg_overform_"+postName).slideUp(500);
		
   }