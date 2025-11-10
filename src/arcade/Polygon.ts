class Polygon {

    private static Sign(p1: Vec2, p2: Vec2, p3: Vec2): number {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }

    public static PointInTriangle(p: Vec2, v1: Vec2, v2: Vec2, v3: Vec2): boolean {
        let d1 = Polygon.Sign(p, v1, v2);
        let d2 = Polygon.Sign(p, v2, v3);
        let d3 = Polygon.Sign(p, v3, v1);

        let hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        let hasNeg = d1 < 0 || d2 < 0 || d3 < 0;

        return !hasPos || !hasNeg;
    }

    public static IsEar(index: number, polygon: Vec2[]): boolean {
        let l = polygon.length;
        let prev = polygon[(index - 1 + l) % l];
        let p = polygon[index];
        let next = polygon[(index + 1) % l];

        let e1 = next.subtract(p);
        let e2 = prev.subtract(p);
        let a = e1.angleTo(e2);

        if (a > 0 && a < Math.PI) {
            for (let i = 0; i < polygon.length; i++) {
                if (
                    i != index &&
                    i != (index - 1 + l) % l &&
                    i != (index + 1) % l
                ) {
                    if (Polygon.PointInTriangle(polygon[i], prev, p, next)) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    public static TriangleArea(v1: Vec2, v2: Vec2, v3: Vec2): number {
        return Math.abs(v2.subtract(v1).cross(v3.subtract(v1))) * 0.5;
    }

    public static GetSurface(polygon: Vec2[]): number {
        console.log("GetSurface " + polygon.length + " points");
        let tmpCutPolygon = [...polygon];
        let area = 0;
        let triCount = 0;
        while (tmpCutPolygon.length > 2) {
            let earIndex = 0;
            for (let i = 0; i < tmpCutPolygon.length; i++) {
                if (Polygon.IsEar(i, tmpCutPolygon)) {
                    earIndex = i;
                    break;
                }
            }
            let l = tmpCutPolygon.length;
            let prev = tmpCutPolygon[(earIndex - 1 + l) % l];
            let p = tmpCutPolygon[earIndex];
            let next = tmpCutPolygon[(earIndex + 1) % l];
            area += Polygon.TriangleArea(prev, p, next);
            tmpCutPolygon.splice(earIndex, 1);
            triCount++;
        }
        console.log("TriCount " + triCount);
        return area;
    }

    public static BBoxCenter(polygon: Vec2[]): Vec2 {
        let min = polygon[0].clone();
        let max = polygon[0].clone();

        for (let i = 1; i < polygon.length; i++) {
            min.minimizeInPlace(polygon[i]);
            max.maximizeInPlace(polygon[i]);
        }

        return min.addInPlace(max).scaleInPlace(0.5);
    }
}