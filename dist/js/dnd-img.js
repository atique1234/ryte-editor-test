function makeDnDHolder(imgHolder)
{
	var holder = document.getElementById(imgHolder);
	
	var testnodes = "";
	
	var uploadNode = document.createElement("p");
	uploadNode.setAttribute('id','upload'+imgHolder);

	//holder.parentNode.insertBefore(uploadNode, holder.nextSibling);
	uploadNode.innerHTML = '<label>Drag &amp; drop not supported, but you can still upload via this input field:<br><input type="file"></label>';
	uploadNode.classList.add("hidden");
	holder.appendChild(uploadNode);
	
	var filereaderNode = document.createElement("p");
	filereaderNode.setAttribute('id','filereader'+imgHolder);
	//holder.parentNode.insertBefore(filereaderNode, holder.nextSibling);
	filereaderNode.innerHTML = "File API &amp; FileReader API not supported";
	holder.appendChild(filereaderNode);
	
	var formdataNode = document.createElement("p");
	formdataNode.setAttribute('id','formdata'+imgHolder);
	//holder.parentNode.insertBefore(formdataNode, holder.nextSibling);
	formdataNode.innerHTML = "XHR2's FormData is not supported";
	holder.appendChild(formdataNode);
	
	var uploadprogressNode = document.createElement("progress");
	uploadprogressNode.setAttribute('id','uploadprogress'+imgHolder);
	//uploadprogressNode.innerHTML = "0";
	//uploadprogressNode.setAttribute('value','0');
	uploadprogressNode.value = uploadprogressNode.innerHTML = 0;
	holder.parentNode.insertBefore(uploadprogressNode, holder.nextSibling);
	
	var progressNode = document.createElement("p");
	progressNode.setAttribute('id','progress'+imgHolder);
	progressNode.innerHTML = "XHR2's upload progress isn't supported";
	holder.parentNode.insertBefore(progressNode, holder.nextSibling);
	
	
	
	
	var	tests = {
		  filereader: typeof FileReader != 'undefined',
		  dnd: 'draggable' in document.createElement('span'),
		  formdata: !!window.FormData,
		  progress: "upload" in new XMLHttpRequest
		}, 
		support = {
		  filereader: filereaderNode,
		  formdata: formdataNode,
		  progress: progressNode //document.getElementById('progress')
		},
		acceptedTypes = {
		  'image/png': true,
		  'image/jpeg': true,
		  'image/gif': true
		},
		progress = uploadprogressNode, //document.getElementById('uploadprogress'),
		fileupload = uploadNode; //document.getElementById('upload');
        progress.classList.add("hidden");
	"filereader formdata progress".split(' ').forEach(function (api) {
	   
	  if (tests[api] === false) {
		support[api].className = 'fail';
	  } else {
	   // console.log("here");
		// FFS. I could have done el.hidden = true, but IE doesn't support
		// hidden, so I tried to create a polyfill that would extend the
		// Element.prototype, but then IE10 doesn't even give me access
		// to the Element object. Brilliant.
		support[api].className = 'hidden';
	  }
	});

	function previewfile(file) {
	  if (tests.filereader === true && acceptedTypes[file.type] === true) {
		var reader = new FileReader();
		reader.onload = function (event) {
		  var imageTmp = document.getElementById('image-in-'+imgHolder);
		  //only one image will be placed in the holder
		  if(imageTmp!==undefined && imageTmp!==null)
		  {
			 imageTmp.src = event.target.result;
			 //imageTmp.max-width = 100%; 
			 
			
				
		  }
		  else{
			  var image = new Image();
			  image.setAttribute('id','image-in-'+imgHolder);
			  image.src = event.target.result;
			  //image.setAttribute('width','100%');
			 // image.setAttribute('height','100%');
			 // image.setAttribute('max-height','100%');
			  //image.height = 320;
			 // image.width = 330; // a fake resize
			  holder.appendChild(image);
			  holder.classList.add("imgHolder-filled");
		  }
		};

		reader.readAsDataURL(file);
	  }  else {
		holder.innerHTML += '<p>Uploaded ' + file.name + ' ' + (file.size ? (file.size/1024|0) + 'K' : '');
		console.log(file);
	  }
	}

	function readfiles(files) {
		//debugger;
		var formData = tests.formdata ? new FormData() : null;
		for (var i = 0; i < files.length; i++) {
		  if (tests.formdata) formData.append('file', files[i]);
		  previewfile(files[i]);
		}

		// now post a new XHR request
		if (tests.formdata) {
		  var xhr = new XMLHttpRequest();
		  xhr.open('POST', '/devnull.php');
		  xhr.onload = function() {
			progress.value = progress.innerHTML = 100;
		  };

		  if (tests.progress) {
			xhr.upload.onprogress = function (event) {
			  if (event.lengthComputable) {
				var complete = (event.loaded / event.total * 100 | 0);
				progress.value = progress.innerHTML = complete;
			  }
			}
			if(progress.value == 0 || progress.value == 100)
			{
				progress.classList.add("hidden");
				//console.log('progress.hidden: '+progress.value);
			}
			else
			{
				progress.classList.remove("hidden");
			}
		  }

		  xhr.send(formData);
		}
	}

	if (tests.dnd) { 
	  holder.ondragover = function () 
	  { 
	    //console.log("dragover: "+this);
		//this.className = 'hover'; 
		//this.classList.add("holderHover");
		return false; 
	  };
	  holder.ondragend = function () 
	  { 
		//this.className = ''; 
		//this.classList.remove("holderHover");
		return false; 
	  };
	  holder.ondrop = function (e) {
		//this.className = '';
		//this.classList.remove("holderHover");
		e.preventDefault();
		readfiles(e.dataTransfer.files);
	  }
	} else {
	  fileupload.className = 'hidden';
	  fileupload.querySelector('input').onchange = function () {
		readfiles(this.files);
	  };
	}
	return imgHolder;
};