import * as React from 'react';
import * as data from './data';
import * as Snippet from './snippetBuilder';
import * as sui from './sui';
import { SimulatorDisplay } from './simulatorDisplay';

const PICKER_WIDTH  = 295;
const PICKER_HEIGHT = 213;

interface PositionPickerProps {
    valueMap?: pxt.Map<number>;
    defaultX?: number;
    defaultY?: number;
    input: pxt.SnippetQuestionInput;
    onChange: (answerToken: string) => (v: string) => void;
}

interface PositionPickerState {
    x: number;
    y: number;
    finalX?: number;
    finalY?: number;
    dotVisible: boolean;
    scale?: number;
}

export class PositionPicker extends data.Component <PositionPickerProps, PositionPickerState> {
    private grid: JSX.Element[];
    constructor(props: PositionPickerProps) {
        super(props);
        this.state = {
            x: this.props.defaultX || 80,
            y: this.props.defaultY || 60,
            dotVisible: false
        };

        this.grid = this.buildGrid();
        this.onMouseMove = this.onMouseMove.bind(this);
        this.setDot = this.setDot.bind(this);
        this.onChange = this.onChange.bind(this);
        this.setScale = this.setScale.bind(this);
    }

    componentDidMount() {
        // Run once on component mount
        this.setScale();

        window.addEventListener('resize', this.setScale);
    }

    /**
     * Sets the number to scale the position picker and simulator display
     */
    protected setScale() {
        // 1023 - full size value
        const height = window.innerHeight;
        // 2100 - full size value
        const width = window.innerWidth;

        let scale = height > width ? width / 2100 : height / 1003;

        // Minimum resize threshold
        if (scale < .81) {
            scale = .81;
        }
        // Maximum resize threshhold
        else if (scale > 1.02) {
            scale = 1.02;
        }

        this.setState({ scale })
    }

    protected setPosition(x: number, y: number) {
        const pickerContainer = this.refs['positionPickerContainer'] as HTMLDivElement;
        const width = pickerContainer.clientWidth;
        const height = pickerContainer.clientHeight;

        x = Math.round(Math.max(0, Math.min(width, x + 1)));
        y = Math.round(Math.max(0, Math.min(height, y + 1)));

        this.setState({ x, y });
    }

    protected getScale(scaleDivisor: number, scaleMultiplier: number) {
        const { scale } = this.state;
        const currentWidth = scaleMultiplier * scale;

        return currentWidth / scaleDivisor;
    }

    protected getXScale() {
        return this.getScale(160, PICKER_WIDTH); // 160 is the width of the simulator
    }

    protected getYScale() {
        return this.getScale(120, PICKER_HEIGHT); // 120 is the height of the simulator
    }

    protected scalePoint(point: number, x?: true) {
        const xScale = this.getXScale();
        const yScale = this.getYScale();

        if (!isNaN(point)) {
            return Math.round(point / ((x ? xScale : yScale)))
        }
        return 0;
    }

    protected unScalePoint(point: number, x?: true) {
        const xScale = this.getXScale();
        const yScale = this.getYScale();

        if (!isNaN(point)) {
            return Math.round(point * (x ? xScale : yScale));
        }

        return 0;
    }

    protected getScaledPoints() {
        const { x, y } = this.state;
        return {
            x: this.scalePoint(x),
            y: this.scalePoint(y),
        };
    }

    protected scalePixel(numberToScale: number) {
        const { scale } = this.state;

        return `${numberToScale * scale}px`;
    }

    protected onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (e.nativeEvent.offsetX && e.nativeEvent.offsetY) {
            this.setPosition(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }
    }

    protected setDot(e: React.MouseEvent<HTMLDivElement>) {
        const { input, onChange } = this.props;
        const mouseX = e.nativeEvent.offsetX;
        const mouseY = e.nativeEvent.offsetY;

        this.setState({
            dotVisible: true,
            x: mouseX,
            y: mouseY,
        }, () => {
            if (!Snippet.isSnippetInputAnswerSingular(input)) {
                const pos = this.getScaledPoints();

                onChange(input.answerTokens[0])(pos.x.toString());
                onChange(input.answerTokens[1])(pos.y.toString());
            }
        });
    }

    protected onChange = (x: boolean) => (v: string) => {
        const { input, onChange } = this.props;

        if (!Snippet.isSnippetInputAnswerSingular(input)) {
            const pos = this.state;
            let newValue = parseInt(v);
            if (isNaN(newValue) || newValue < 0) {
                // Return if change is not valid
                return;
            }

            this.setState({
                x: x ? this.unScalePoint(newValue) : pos.x,
                y: !x ? this.unScalePoint(newValue) : pos.y,
            }, () => {
                const pos = this.getScaledPoints();
                if (x) onChange(input.answerTokens[0])(pos.x.toString());
                if (!x) onChange(input.answerTokens[1])(pos.y.toString());

                this.setState({
                    dotVisible: true,
                });
            });
        }
    }

    protected buildGrid() {
        let gridDivs: JSX.Element[] = [];
        for (let i = 1; i < 16; ++i) {
            gridDivs.push(<div className='position-picker cross-y' style={{ left: `${i * 20}px` }} key={`grid-line-y-${i}`} />);
        }

        for (let i = 1; i < 12; ++i) {
            gridDivs.push(<div className='position-picker cross-x' style={{ top: `${i * 20}px` }} key={`grid-line-x-${i}`} />);
        }

        return gridDivs;
    }

    public renderCore() {
        const { dotVisible, x, y, scale } = this.state;
        const pos = this.getScaledPoints();

        return (
            <div>
                <div className='ui grid'>
                    <div className='column'>
                        <sui.Input
                            class={'position-picker preview-input'}
                            value={(pos.x).toString()}
                            onChange={this.onChange(true)}
                        />
                    </div>
                    <div className='column'>
                        <sui.Input
                            class={'position-picker preview-input'}
                            value={(pos.y).toString()}
                            onChange={this.onChange(false)}
                        />
                    </div>
                </div>
                <SimulatorDisplay scale={scale}>
                    <div
                        ref={'positionPickerContainer'}
                        className='position-picker container'
                        onClick={this.setDot}
                        style={{
                            left: this.scalePixel(28),
                            top: this.scalePixel(28),
                            width: this.scalePixel(PICKER_WIDTH),
                            height: this.scalePixel(PICKER_HEIGHT),
                            margin: `8px`,
                            maxWidth: this.scalePixel(PICKER_WIDTH),
                            maxHeight: this.scalePixel(PICKER_HEIGHT),
                        }}
                        role='grid'
                    >
                        {this.grid.map((grid) => grid)}
                        <div className='position-picker cross-x' />
                        <div className='position-picker cross-y' />
                        {dotVisible && <div className='position-picker dot' style={{ top: `${(y)}px` , left: `${(x)}px` }} />}
                    </div>
                </SimulatorDisplay>
            </div>
        )
    }
}