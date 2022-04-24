const app = Vue.createApp({
    data(){
        return{
           videoId: "Qrp9WQegYX4",
           playerVars: {
            autoplay: 1,
            controls: 0,
            showinfo:0,
            modestbranding: 1,
            fs:1,
            autohide:0,
          },
          player:null,
          interval:null,
          seconds:120,
          progress:10,
          playbutton:"fas fa-stop-circle fa-3x",
          videoobj:null,
          numberofvids:null,
          currentid:1,
          oldid:1,
          newid:2,
          webcamnamenow:"loading...",
          webcamnamenext:"loading...",
          camarray: [],
          camarrayfiltered: [],
          search: "",
          searchform: "input is-normal",
          transition: "transition on",
          alreadywatched: [0]
        }
    },
    created(){
        fetch("https://lulaschkas.github.io/twominutecam/webcams.json")
        .then(response => response.json())
        .then((api)=>{                  
            this.videoobj=api;
            this.numberofvids=Object.keys(api).length;
            this.camarray=Object.values(api);
            camkeys=Object.keys(api);
            //add the url to each object in the camarray
            for(i=0; i<this.numberofvids; i++){
                this.camarray[i]["url"]=camkeys[i]
            }
            this.camarrayfiltered=this.camarray
            setTimeout(()=>{
                //get the youtube video id
                firstid=this.getvideoid(camkeys[0])
                //get the next random video
                do{
                    newid=Math.floor(Math.random() * (this.numberofvids ));
                } while(newid==firstid);
                this.webcamnamenext=this.camarray[newid]["name"]
                this.initYoutube(firstid)
                this.webcamnamenow=this.camarray[0]["name"]
                this.worldmap(this.camarray[0]["country"])
                this.transition= "transition off"
                this.newid=newid

            }, 1500);
            this.timer();
        });
    },
    methods:{  //   
        searchfunc(){
            this.search = this.search.charAt(0).toUpperCase() + this.search.slice(1)
            regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
            
            if(this.search==""){
                this.searchform="input is-normal"
                this.resetfilter()
            }
            else if(this.search.length <= 2){
                this.filtervideo(this.search)
            }
            else{
                code = Object.keys(isoCountries).find(key => isoCountries[key] === this.search);
                if(code === undefined || code === null){
                    this.searchform="input is-danger"
                }else{
                    this.filtervideo(code)
                }
            }
        },
        resetfilter(){
            this.camarrayfiltered=this.camarray
        },
        filtervideo(code){
            this.searchform="input is-danger"
            this.camarrayfiltered=[]
            code=code.toUpperCase();
            for (const key in this.videoobj) {      
                obj=this.videoobj[key];
                if(obj["country"]==code){
                    this.searchform="input is-success"
                    this.camarrayfiltered.push({                         
                        "name": obj["name"],
                        "country": obj["country"],
                        "date-added": obj["date-added"],
                        "url": key
                    });
                }
            }
        },
        countrycode(url){
            for (const key in this.videoobj) {                
                if(this.videoobj[key]["url"]==url){
                    obj = this.videoobj[key]["country"]
                    return obj;
                }
            }
        }, 
        getcountryimgurl(ccode){
            return "https://cdn.jsdelivr.net/gh/hjnilsson/country-flags@latest/svg/" + ccode.toLowerCase() + ".svg";
        },     
        getvideoid(url){
            return url.split("watch?v=")[1];
        },
        buttonnext(){
            this.nextvideo(this.newid);  
        },
        buttonprev(){
            this.seconds=120;
            this.nextvideo(this.oldid);
        },
        nextvideo(position){
            this.transition= "transition on"
            this.seconds=120;
            this.alreadywatched.push(position)
            if(this.alreadywatched.length == Object.values(this.videoobj).length){ //reset the array of already watched videos, when all videos have been watched
                console.info("[DEBUG] reset watched array")
                this.alreadywatched=[]
            }
            do{
                id=Math.floor(Math.random() * (this.numberofvids ));
            } while(id==position || this.alreadywatched.includes(id));
            this.newid=id;
            this.webcamnamenow=this.camarray[position]["name"]
            this.webcamnamenext=this.camarray[this.newid]["name"]
            this.oldid=this.currentid;
            this.currentid=position;
            //start loading video and map after loading animation appeared
            setTimeout(()=>{
                //update svg map
                document.getElementById("svgMap").innerHTML = ""
                this.worldmap(this.camarray[position]["country"])
                //update yt video player
                this.player.loadVideoById(this.getvideoid(this.camarray[position]["url"]));
            }, 500)
            setTimeout(()=>this.transition= "transition off", 1500)

        },
        timer() {
            this.interval = setInterval(() => {
                this.seconds--;
                this.progress=this.seconds/1.2;
                if(this.seconds==0){
                    this.nextvideo(this.newid);
                    this.seconds=120;
                }
            }, 1000)
        },
        stoptimer(){
            if(this.playbutton=="fas fa-stop-circle fa-3x"){
                clearInterval(this.interval);
                this.playbutton="fas fa-play-circle fa-3x";
            }
            else{
                this.timer();
                this.playbutton="fas fa-stop-circle fa-3x";
            }

        },
        initYoutube(id){
            this.player = new YT.Player('ytplayer', {
                videoId: id, // YouTube Video ID
                playerVars: {
                    autoplay: 1, // Auto-play the video on load
                    controls: 1, // Show pause/play buttons in player
                    showinfo: 0, // Hide the video title
                    modestbranding: 1, // Hide the Youtube Logo
                    loop: 1, // Run the video in a loop
                    fs: 1, // Hide the full screen button
                    cc_load_policy: 0, // Hide closed captions
                    iv_load_policy: 3, // Hide the Video Annotations
                    autohide: 1, // Hide video controls when playing
                },
                events: {
                    onReady: function (e) {
                    e.target.mute();
                    },
                },
            });    
        },
        worldmap(name){
            obj={
                targetElementID: 'svgMap',
                noDataText: '',
                data: {
                  data: {
                    country: {
                      name: '',
                      format: 'This cam is located here!',
                    }
                  },
                  applyData: 'country',
                  values: {
                    IN: {
                        color: 'red',
                    }
                  
                  }
                }
              }
            obj.data.values[name]=obj.data.values.IN;
            delete obj.data.values.IN;
            new svgMap(obj);
            
        }
    }
})
app.mount('#maincontent');
