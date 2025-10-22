var UV_S: number = 0.75;

class BrickVertexDataGenerator {

    public static GetBoxVertexData(length: number, height: number, width: number, lod: number = 1): BABYLON.VertexData {
        let xMin = -BRICK_S * 0.5;
        let yMin = 0;
        let zMin = -BRICK_S * 0.5;
        let xMax = xMin + width * BRICK_S;
        let yMax = yMin + height * BRICK_H;
        let zMax = zMin + length * BRICK_S;

        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMin, yMin, zMin),
            p2: new BABYLON.Vector3(xMax, yMin, zMin),
            p3: new BABYLON.Vector3(xMax, yMax, zMin),
            p4: new BABYLON.Vector3(xMin, yMax, zMin),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let right = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMin),
            p2: new BABYLON.Vector3(xMax, yMin, zMax),
            p3: new BABYLON.Vector3(xMax, yMax, zMax),
            p4: new BABYLON.Vector3(xMax, yMax, zMin),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMax),
            p2: new BABYLON.Vector3(xMin, yMin, zMax),
            p3: new BABYLON.Vector3(xMin, yMax, zMax),
            p4: new BABYLON.Vector3(xMax, yMax, zMax),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let left = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMin, yMin, zMax),
            p2: new BABYLON.Vector3(xMin, yMin, zMin),
            p3: new BABYLON.Vector3(xMin, yMax, zMin),
            p4: new BABYLON.Vector3(xMin, yMax, zMax),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let top = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMax, zMin),
            p2: new BABYLON.Vector3(xMax, yMax, zMax),
            p3: new BABYLON.Vector3(xMin, yMax, zMax),
            p4: new BABYLON.Vector3(xMin, yMax, zMin),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let bottom = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMin),
            p2: new BABYLON.Vector3(xMin, yMin, zMin),
            p3: new BABYLON.Vector3(xMin, yMin, zMax),
            p4: new BABYLON.Vector3(xMax, yMin, zMax),
            uvInWorldSpace: true,
            uvSize: UV_S
        });

        let data = Mummu.MergeVertexDatas(back, right, front, left, top, bottom);
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }

    public static GetTextBrickVertexData(width: number, height: number): BABYLON.VertexData {
        let xMin = -BRICK_S * 0.5;
        let yMin = 0;
        let zMin = BRICK_S * 0.5 - BRICK_H;
        let xMax = xMin + width * BRICK_S;
        let yMax = yMin + height * BRICK_H;
        let zMax = BRICK_S * 0.5;

        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMin, yMin, zMin),
            p2: new BABYLON.Vector3(xMax, yMin, zMin),
            p3: new BABYLON.Vector3(xMax, yMax, zMin),
            p4: new BABYLON.Vector3(xMin, yMax, zMin)
        });
        let right = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMin),
            p2: new BABYLON.Vector3(xMax, yMin, zMax),
            p3: new BABYLON.Vector3(xMax, yMax, zMax),
            p4: new BABYLON.Vector3(xMax, yMax, zMin)
        });
        right.uvs = [0, 0, 0, 0, 0, 0, 0, 0];
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMax),
            p2: new BABYLON.Vector3(xMin, yMin, zMax),
            p3: new BABYLON.Vector3(xMin, yMax, zMax),
            p4: new BABYLON.Vector3(xMax, yMax, zMax)
        });
        let left = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMin, yMin, zMax),
            p2: new BABYLON.Vector3(xMin, yMin, zMin),
            p3: new BABYLON.Vector3(xMin, yMax, zMin),
            p4: new BABYLON.Vector3(xMin, yMax, zMax)
        });
        left.uvs = [0, 0, 0, 0, 0, 0, 0, 0];
        let top = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMax, zMin),
            p2: new BABYLON.Vector3(xMax, yMax, zMax),
            p3: new BABYLON.Vector3(xMin, yMax, zMax),
            p4: new BABYLON.Vector3(xMin, yMax, zMin)
        });
        top.uvs = [0, 0, 0, 0, 0, 0, 0, 0];
        let bottom = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMin),
            p2: new BABYLON.Vector3(xMin, yMin, zMin),
            p3: new BABYLON.Vector3(xMin, yMin, zMax),
            p4: new BABYLON.Vector3(xMax, yMin, zMax)
        });
        bottom.uvs = [0, 0, 0, 0, 0, 0, 0, 0];

        let data = Mummu.MergeVertexDatas(back, right, front, left, top, bottom);
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }

    public static async GetBoxCornerCurvedVertexData(length: number, height: number, width: number, lod: number = 1): Promise<BABYLON.VertexData> {
        let innerR: number = (length - width) * BRICK_S;
        let outterR: number = length * BRICK_S;
        let y = height * BRICK_H;

        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(innerR, 0, 0),
            p2: new BABYLON.Vector3(outterR, 0, 0),
            p3: new BABYLON.Vector3(outterR, y, 0),
            p4: new BABYLON.Vector3(innerR, y, 0),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let right = Mummu.CreateCylinderSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: outterR,
            yMin: 0,
            yMax: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(0, 0, outterR),
            p2: new BABYLON.Vector3(0, 0, innerR),
            p3: new BABYLON.Vector3(0, y, innerR),
            p4: new BABYLON.Vector3(0, y, outterR),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let left = Mummu.CreateCylinderSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: innerR,
            yMin: 0,
            yMax: y,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let top = Mummu.CreateDiscSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            innerRadius: innerR,
            outterRadius: outterR,
            y: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let bottom = Mummu.CreateDiscSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            innerRadius: innerR,
            outterRadius: outterR,
            y: 0,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });

        let data = Mummu.MergeVertexDatas(back, right, front, left, top, bottom);
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(- innerR - BRICK_S * 0.5, 0, - BRICK_S * 0.5))
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }

    public static async GetBoxQuarterVertexData(length: number, height: number, lod: number = 1): Promise<BABYLON.VertexData> {
        let radius: number = length * BRICK_S;
        let y = height * BRICK_H;

        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(0, 0, 0),
            p2: new BABYLON.Vector3(radius, 0, 0),
            p3: new BABYLON.Vector3(radius, y, 0),
            p4: new BABYLON.Vector3(0, y, 0),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let right = Mummu.CreateCylinderSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: radius,
            yMin: 0,
            yMax: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(0, 0, radius),
            p2: new BABYLON.Vector3(0, 0, 0),
            p3: new BABYLON.Vector3(0, y, 0),
            p4: new BABYLON.Vector3(0, y, radius),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let top = Mummu.CreateDiscVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: radius,
            y: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let bottom = Mummu.CreateDiscVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: radius,
            y: 0,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });

        let data = Mummu.MergeVertexDatas(back, right, front, top, bottom);
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(- BRICK_S * 0.5, 0, - BRICK_S * 0.5))
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }

    public static async GetStuddedCutBoxVertexData(cut: number, length: number, height: number, width: number, lod: number = 1): Promise<BABYLON.VertexData> {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/plate-corner-cut.babylon");
        let cutBoxRawData = Mummu.CloneVertexData(datas[0]);
        let dx = (width - 2) * BRICK_S;
        let dxCut = (cut - 1) * BRICK_S;
        let dy = (height - 1) * BRICK_H;
        let dz = (length - 2) * BRICK_S;
        let dzCut = (cut - 1) * BRICK_S;
        let positions = cutBoxRawData.positions;
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];

            if (x > BRICK_S) {
                x += dx;
            }
            else if (x > 0) {
                x += dxCut;
            }

            if (y > BRICK_H * 0.5) {
                y += dy;
            }

            if (z > BRICK_S) {
                z += dz;
            }
            else if (z > 0) {
                z += dzCut;
            }
            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }

        cutBoxRawData.positions = positions;
        let normals = [];
        BABYLON.VertexData.ComputeNormals(cutBoxRawData.positions, cutBoxRawData.indices, normals);
        cutBoxRawData.normals = normals;
        cutBoxRawData.colors = undefined;

        BrickVertexDataGenerator.AddMarginInPlace(cutBoxRawData);
        
        return cutBoxRawData;
    }

    public static async GetWindowFrameVertexData(length: number, height: number, lod: number = 1): Promise<BABYLON.VertexData> {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/window-frame_2x2.babylon");
        let cutBoxRawData = Mummu.CloneVertexData(datas[0]);
        let dy = (height - 2) * BRICK_H * 3;
        let dz = (length - 2) * BRICK_S;
        let positions = cutBoxRawData.positions;
        let normals = cutBoxRawData.normals;
        let uvs = cutBoxRawData.uvs;
        for (let i = 0; i < positions.length / 3; i++) {
            let nx = normals[3 * i];
            let ny = normals[3 * i + 1];
            let nz = normals[3 * i + 2];

            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];

            let face = 0;

            if (nx > 0.9) {
                face = 1;
            }
            else if (nx < -0.9) {
                face = 1;
            }
            else if (y < 0.001 && ny < - 0.9) {
                face = 2;
            }
            else if (y > 6 * BRICK_H - 0.001 && ny > 0.9) {
                face = 2;
            }
            else if (z < - 0.5 * BRICK_S + 0.01 && nz < - 0.9) {
                face = 3;
            }
            else if (z > BRICK_S * 1.5 - 0.01 && nz > 0.9) {
                face = 3;
            }
            else {
                if (y > BRICK_H * 3 && z > BRICK_S * 0.5) {
                    // do nothing
                    if (uvs[2 * i] > 1) {
                        uvs[2 * i] += 2 * dy + 2 * dz;
                    }
                }
                else if (y < BRICK_H * 3 && z > BRICK_S * 0.5) {
                    uvs[2 * i] += dy;
                }
                else if (y < BRICK_H * 3 && z < BRICK_S * 0.5) {
                    uvs[2 * i] += dy + dz;
                }
                else if (y > BRICK_H * 3 && z < BRICK_S * 0.5) {
                    uvs[2 * i] += 2 * dy + dz;
                }
            }

            if (y > BRICK_H * 3) {
                y += dy;
            }

            if (z > BRICK_S * 0.5) {
                z += dz;
            }

            if (face === 1) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = y;
            }
            else if (face === 2) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = x;
            }
            else if (face === 3) {
                uvs[2 * i] = x;
                uvs[2 * i + 1] = y;
            }
            uvs[2 * i] /= UV_S;
            uvs[2 * i + 1] /= UV_S;

            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }

        cutBoxRawData.positions = positions;
        cutBoxRawData.uvs = uvs;
        BABYLON.VertexData.ComputeNormals(cutBoxRawData.positions, cutBoxRawData.indices, normals);
        cutBoxRawData.normals = normals;
        cutBoxRawData.colors = undefined;

        BrickVertexDataGenerator.AddMarginInPlace(cutBoxRawData);
        
        return cutBoxRawData;
    }

    public static async GetWindowFrameCornerCurvedVertexData(length: number, height: number, lod: number = 1): Promise<BABYLON.VertexData> {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/window-frame-corner_" + length + ".babylon");
        let index = height - 2;
        let data = Mummu.CloneVertexData(datas[index]);

        if (data) {
            let uvs = data.uvs;
            for (let i = 0; i < uvs.length; i++) {
                uvs[i] = uvs[i] / UV_S;
            }
            data.uvs = uvs;
            BrickVertexDataGenerator.AddMarginInPlace(data);
            return data;
        }

        return undefined;
    }

    public static async GetBrickRoundVertexData(length: number, lod: number = 1): Promise<BABYLON.VertexData> {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/brick-round_1x1.babylon");
        let cutBoxRawData = Mummu.CloneVertexData(datas[0]);
        let dz = (length - 1) * BRICK_S;
        let positions = cutBoxRawData.positions;
        let normals = cutBoxRawData.normals;
        let uvs = cutBoxRawData.uvs;
        for (let i = 0; i < positions.length / 3; i++) {
            let nx = normals[3 * i];
            let ny = normals[3 * i + 1];
            let nz = normals[3 * i + 2];

            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];

            if (z > 0) {
                z += dz;
            }

            if (ny < - 0.9) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = x;
            }
            else if (nx < - 0.9) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = y;
            }
            else if (nz < - 0.9 || nz > 0.9) {

            }
            else {
                if (z > 0) {
                    uvs[2 * i] += dz;
                }
            }

            positions[3 * i + 2] = z;
        }

        cutBoxRawData.positions = positions;
        cutBoxRawData.uvs = uvs;
        cutBoxRawData.colors = undefined;

        BrickVertexDataGenerator.AddMarginInPlace(cutBoxRawData);
        
        return cutBoxRawData;
    }

    public static AddMarginInPlace(vertexData: BABYLON.VertexData, margin: number = 0.001, cx: number = 0, cy: number = BRICK_H * 0.5, cz: number = 0): void {
        let positions = vertexData.positions;
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];

            if (x > cx) {
                x -= margin;
            }
            else {
                x += margin;
            }

            if (y > cy) {
                y -= margin;
            }
            else {
                y += margin;
            }
            
            if (z > cz) {
                z -= margin;
            }
            else {
                z += margin;
            }

            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }
    }
}
