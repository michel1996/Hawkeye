class ModelInteraction {
    constructor(scene,camera) {
        this.scene = scene;
        this.camera = camera;
    }
    zoomIn(){
        this.camera.zoom -=0.1;
        this.camera.updateProjectionMatrix();
    }
    zoomOut(){
        this.camera.zoom +=0.1;
        this.camera.updateProjectionMatrix();
    }
}

export { ModelInteraction };